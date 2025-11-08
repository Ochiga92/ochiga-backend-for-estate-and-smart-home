import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    private readonly aiAgent: AiAgent, // 🧠 Injected AI brain
  ) {}

  /** 🔹 Get wallet by user ID */
  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'transactions'],
    });

    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  /** 🔹 Create wallet for user if none exists */
  async createWallet(userId: string): Promise<Wallet> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let wallet = await this.walletRepo.findOne({ where: { user: { id: userId } } });
    if (wallet) return wallet;

    wallet = this.walletRepo.create({
      user,
      balance: 0,
      currency: 'NGN',
    });

    return this.walletRepo.save(wallet);
  }

  /** 🔹 Fund wallet (increase balance) */
  async fundWallet(userId: string, amount: number): Promise<{ wallet: Wallet; tx: Transaction }> {
    if (amount <= 0) throw new BadRequestException('Invalid amount');

    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance = Number(wallet.balance) + amount;

    const tx = this.txRepo.create({
      type: TransactionType.FUND,
      amount,
      description: 'Wallet funded',
      wallet,
    });

    await this.walletRepo.save(wallet);
    await this.txRepo.save(tx);

    return { wallet, tx };
  }

  /** 🔹 Debit wallet (reduce balance) */
  async debitWallet(userId: string, amount: number): Promise<{ wallet: Wallet; tx: Transaction }> {
    if (amount <= 0) throw new BadRequestException('Invalid amount');

    const wallet = await this.getOrCreateWallet(userId);
    if (Number(wallet.balance) < amount) throw new BadRequestException('Insufficient funds');

    wallet.balance = Number(wallet.balance) - amount;

    const tx = this.txRepo.create({
      type: TransactionType.DEBIT,
      amount,
      description: 'Wallet debited',
      wallet,
    });

    await this.walletRepo.save(wallet);
    await this.txRepo.save(tx);

    return { wallet, tx };
  }

  /** 🔹 Smart: get wallet if exists, else auto-create */
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');

      wallet = this.walletRepo.create({
        user,
        balance: 0,
        currency: 'NGN',
      });
      wallet = await this.walletRepo.save(wallet);
    }

    return wallet;
  }

  /** 🔹 Get user wallet balance only (for Assistant integration) */
  async getBalance(userId: string): Promise<{ balance: number; currency: string }> {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!wallet) throw new NotFoundException('Wallet not found');

    return { balance: wallet.balance, currency: wallet.currency };
  }

  // 🧠 AI Feature: Spending Pattern Analysis
  async analyzeSpendingPattern(transactions: any[]) {
    const prompt = `Analyze this user's spending history and recommend financial optimization strategies:
    ${JSON.stringify(transactions, null, 2)}`;

    return await this.aiAgent.queryExternalAgent(prompt, transactions);
  }

  // 🧠 AI Feature: Predict Future Wallet Trends
  async predictWalletTrends(walletData: any) {
    const prompt = `Given this wallet data, predict future balance trends, potential overspending risks, and savings opportunities:
    ${JSON.stringify(walletData, null, 2)}`;

    return await this.aiAgent.queryExternalAgent(prompt, walletData);
  }
}

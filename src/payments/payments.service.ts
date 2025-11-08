import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { AiAgent } from '../ai/ai.agent';
import { v4 as uuid } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,

    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,

    private readonly aiAgent: AiAgent, // 🧠 AI injection
  ) {}

  /** Create a new payment */
  async create(user: User, dto: CreatePaymentDto) {
    const wallet = await this.walletRepo.findOne({ where: { user: { id: user.id } } });
    if (!wallet) throw new NotFoundException('Wallet not found for this user');

    const payment = this.paymentsRepo.create({
      amount: dto.amount,
      description: dto.description,
      provider: dto.provider,
      currency: dto.currency ?? 'NGN',
      reference: uuid(),
      status: PaymentStatus.PENDING,
      user,
      wallet,
    });

    return this.paymentsRepo.save(payment);
  }

  async findAll() {
    return this.paymentsRepo.find({ relations: ['user', 'wallet'] });
  }

  async findOne(id: string) {
    return this.paymentsRepo.findOne({
      where: { id },
      relations: ['user', 'wallet'],
    });
  }

  async updateStatus(reference: string, status: PaymentStatus) {
    const payment = await this.paymentsRepo.findOne({ where: { reference } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    return this.paymentsRepo.save(payment);
  }

  // 🧠 AI Feature: Detect fraudulent or unusual payments
  async detectPaymentAnomalies(paymentRecords: any) {
    const prompt = `Analyze payment data for anomalies or suspicious patterns:
    ${JSON.stringify(paymentRecords, null, 2)}`;
    return await this.aiAgent.queryExternalAgent(prompt, paymentRecords);
  }

  // 🧠 AI Feature: Forecast upcoming bills or payment trends
  async predictPaymentTrends(userHistory: any) {
    const prompt = `Predict future payment patterns or delays based on user history:
    ${JSON.stringify(userHistory, null, 2)}`;
    return await this.aiAgent.queryExternalAgent(prompt, userHistory);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { Maintenance } from './entities/maintenance.entity';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class UtilitiesService {
  constructor(
    @InjectRepository(Bill)
    private billRepo: Repository<Bill>,
    @InjectRepository(Maintenance)
    private maintenanceRepo: Repository<Maintenance>,
    private readonly aiAgent: AiAgent, // 🧠 AI Agent
  ) {}

  // Bills
  findAllBills() {
    return this.billRepo.find();
  }

  createBill(data: Partial<Bill>) {
    return this.billRepo.save(this.billRepo.create(data));
  }

  // Maintenance
  findAllMaintenance() {
    return this.maintenanceRepo.find();
  }

  createMaintenance(data: Partial<Maintenance>) {
    return this.maintenanceRepo.save(this.maintenanceRepo.create(data));
  }

  // 🧠 AI Feature: Utility optimization
  async optimizeUtilityUsage(utilityData: any) {
    const prompt = `Analyze estate/home utility usage (electricity, water, waste) and suggest efficiency improvements:
    ${JSON.stringify(utilityData, null, 2)}`;
    return await this.aiAgent.queryExternalAgent(prompt, utilityData);
  }

  // 🧠 AI Feature: Predict equipment failure or maintenance needs
  async predictMaintenanceNeeds(data: any) {
    const prompt = `Predict upcoming maintenance issues based on utility usage and equipment performance logs:
    ${JSON.stringify(data, null, 2)}`;
    return await this.aiAgent.queryExternalAgent(prompt, data);
  }
}

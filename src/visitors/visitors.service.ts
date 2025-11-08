import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from './entities/visitors.entity';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorsRepo: Repository<Visitor>,

    // 🧠 AI Assistant for smart analytics and trend prediction
    private readonly aiAgent: AiAgent,
  ) {}

  // ✅ Create new visitor entry
  async create(visitor: Partial<Visitor>) {
    const newVisitor = this.visitorsRepo.create(visitor);
    const savedVisitor = await this.visitorsRepo.save(newVisitor);

    // 🧠 Optional: Auto-generate quick summary or risk note
    const aiNote = await this.aiAgent.queryExternalAgent(
      `A new visitor record has been added. 
      Generate a short visitor profile summary and potential security consideration if any.`,
      savedVisitor,
    );

    return { ...savedVisitor, aiNote };
  }

  // ✅ Get all visitor records
  async findAll() {
    return await this.visitorsRepo.find();
  }

  // ✅ Get a single visitor by ID
  async findOne(id: string) {
    const visitor = await this.visitorsRepo.findOne({ where: { id } });
    if (!visitor) throw new NotFoundException(`Visitor with ID ${id} not found`);
    return visitor;
  }

  // ✅ Remove a visitor record
  async remove(id: string): Promise<{ message: string; aiNote: string }> {
    const visitor = await this.findOne(id);
    await this.visitorsRepo.remove(visitor);

    // 🧠 AI comment on deletion (for system audit logs)
    const aiNote = await this.aiAgent.queryExternalAgent(
      `A visitor record was deleted from the system. 
      Comment briefly on data privacy and access control policies to consider.`,
      visitor,
    );

    return { message: `Visitor ${id} deleted successfully.`, aiNote };
  }

  // 🧠 ---------------- AI-Powered Features ---------------- //

  /**
   * 🔹 Predict visitor trends, detect anomalies, or identify security alerts
   */
  async predictVisitorTrends(visitorLogs: any) {
    const prompt = `
      You are a Smart Security Analytics Assistant.
      Analyze the following visitor logs to detect:
      - Behavioral patterns
      - Visit frequency trends
      - Potential anomalies or unusual access activity
      - Early warnings that may indicate security concerns

      ${JSON.stringify(visitorLogs, null, 2)}
    `;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, visitorLogs);
    return {
      analysisType: 'Trend Prediction',
      aiAnalysis: aiResponse,
    };
  }

  /**
   * 🔹 Recommend access and surveillance improvements
   * based on visitor trends and security observations.
   */
  async suggestSecurityImprovements(visitorLogs: any) {
    const prompt = `
      You are a smart estate security consultant.
      Based on the following visitor activity logs, suggest improvements for:
      - Access control policies
      - Surveillance coverage
      - Alert and notification protocols
      - Visitor screening and monitoring strategies

      ${JSON.stringify(visitorLogs, null, 2)}
    `;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, visitorLogs);
    return {
      recommendationType: 'Security Enhancement',
      aiRecommendations: aiResponse,
    };
  }

  /**
   * 🔹 Generate a summarized report of all recent visitors
   * (Useful for dashboard display or management review)
   */
  async generateVisitorSummary() {
    const visitors = await this.findAll();

    if (!visitors.length) {
      return { message: 'No visitors found', totalVisitors: 0 };
    }

    const prompt = `
      Summarize the following visitor records into a short, structured report:
      - Number of unique visitors
      - Visit frequency distribution
      - Common visiting hours or days
      - Notable anomalies or high-risk access attempts
      - Recommended visitor management actions

      ${JSON.stringify(visitors, null, 2)}
    `;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, visitors);
    return {
      totalVisitors: visitors.length,
      aiSummary,
    };
  }

  /**
   * 🔹 AI-assisted natural language query search
   * Example: “Find all visitors who came more than twice this week”
   */
  async aiSearchVisitor(query: string) {
    const visitors = await this.findAll();
    const prompt = `
      Based on the following visitor records, answer this query:
      "${query}"

      Provide your response as structured data where possible.
      Visitors:
      ${JSON.stringify(visitors, null, 2)}
    `;

    const aiResult = await this.aiAgent.queryExternalAgent(prompt, visitors);
    return { query, result: aiResult };
  }
}

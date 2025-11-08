import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estate } from './entities/estate.entity';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private readonly estateRepository: Repository<Estate>,

    // 🧠 AI Assistant for insight generation, summaries, and recommendations
    private readonly aiAgent: AiAgent,
  ) {}

  // ✅ Create a new estate record
  async create(createEstateDto: CreateEstateDto): Promise<Estate> {
    const estate = this.estateRepository.create(createEstateDto);
    const savedEstate = await this.estateRepository.save(estate);

    // 🔹 Optional: Generate instant AI note upon creation
    const aiNote = await this.aiAgent.queryExternalAgent(
      `A new estate has been added. Provide a quick summary and improvement suggestion for record keeping.`,
      savedEstate,
    );

    return { ...savedEstate, aiNote } as any;
  }

  // ✅ Retrieve all estates
  async findAll(): Promise<Estate[]> {
    return await this.estateRepository.find();
  }

  // ✅ Retrieve one estate by ID
  async findOne(id: string): Promise<Estate> {
    const estate = await this.estateRepository.findOne({ where: { id } });
    if (!estate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }
    return estate;
  }

  // ✅ Update estate details
  async update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate> {
    const estate = await this.findOne(id);
    Object.assign(estate, updateEstateDto);
    const updatedEstate = await this.estateRepository.save(estate);

    // 🔹 Generate AI-based improvement insights post-update
    const prompt = `
      Analyze the recent update made to the following estate and suggest operational or infrastructural improvements:

      ${JSON.stringify(updatedEstate, null, 2)}
    `;

    const aiInsight = await this.aiAgent.queryExternalAgent(prompt, updatedEstate);
    return { ...updatedEstate, aiInsight } as any;
  }

  // ✅ Delete an estate by ID
  async remove(id: string): Promise<{ message: string; note?: string }> {
    const estate = await this.findOne(id);
    await this.estateRepository.remove(estate);

    // 🧠 AI-powered data retention recommendation
    const aiNote = await this.aiAgent.queryExternalAgent(
      `An estate record was deleted. Provide a brief note on what data retention policies should apply here.`,
      estate,
    );

    return { message: `Estate ${id} deleted successfully.`, note: aiNote };
  }

  // 🧠 ------------------- AI-Powered Features ------------------- //

  /**
   * 🔹 Analyze estate infrastructure and performance.
   * Provides smart insight for energy efficiency, maintenance patterns,
   * and occupant satisfaction.
   */
  async analyzeEstatePerformance(estateData: any) {
    const prompt = `
      You are a Smart Estate Performance Analyst.
      Review and analyze the following estate's operational data.
      Highlight strengths, weaknesses, potential risks,
      and suggest optimization or automation strategies:

      ${JSON.stringify(estateData, null, 2)}
    `;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, estateData);
    return {
      estateData,
      aiAnalysis: aiResponse,
    };
  }

  /**
   * 🔹 Generate AI summary for all estates.
   * Provides a global view of occupancy, efficiency, and areas needing attention.
   */
  async summarizeAllEstates() {
    const estates = await this.findAll();
    if (!estates.length) {
      return { message: 'No estates found', total: 0 };
    }

    const prompt = `
      Summarize the following estates, comparing them based on:
      - Occupancy rate
      - Energy or resource efficiency
      - Maintenance frequency
      - Revenue performance
      - Recommended areas for automation or modernization

      ${JSON.stringify(estates, null, 2)}
    `;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, estates);
    return {
      totalEstates: estates.length,
      aiSummary,
    };
  }

  /**
   * 🔹 AI-Assisted search — use natural language to find estates
   * (Optional feature if integrated with text-based queries later)
   */
  async aiSearchEstate(query: string) {
    const estates = await this.findAll();
    const prompt = `
      From the following estate records, find the one(s) that best match the user query:
      "${query}"

      Estates:
      ${JSON.stringify(estates, null, 2)}
    `;

    const aiResult = await this.aiAgent.queryExternalAgent(prompt, estates);
    return { query, result: aiResult };
  }
}

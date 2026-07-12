import { Injectable } from '@nestjs/common';
import { QuickCaptureCommand } from '../commands/quick-capture.command';
import { QuickCaptureResult } from '../commands/quick-capture.result';
import { TaskApplicationService } from './task-application.service';
import { RegisterTaskCommand } from '../commands/register-task.command';
import * as crypto from 'crypto';

@Injectable()
export class QuickCaptureApplicationService {
  constructor(private readonly taskAppService: TaskApplicationService) {}

  async execute(command: QuickCaptureCommand): Promise<QuickCaptureResult> {
    const textLower = command.text.toLowerCase().trim();

    // Simple heuristic parser
    let type: 'task' | 'goal' | 'habit' | 'note' = 'task';
    if (textLower.startsWith('goal:') || textLower.startsWith('objetivo:')) {
      type = 'goal';
    } else if (
      textLower.startsWith('habit:') ||
      textLower.startsWith('hábito:')
    ) {
      type = 'habit';
    } else if (textLower.startsWith('note:') || textLower.startsWith('nota:')) {
      type = 'note';
    }

    const cleanText = command.text
      .replace(/^(goal|objetivo|habit|hábito|note|nota):/i, '')
      .trim();

    const id = crypto.randomUUID();

    // Today/Tomorrow dates parsing if not explicit
    let dueDate: string | undefined = command.date;
    if (!dueDate) {
      if (textLower.includes('today') || textLower.includes('hoy')) {
        dueDate = new Date().toISOString();
      } else if (
        textLower.includes('tomorrow') ||
        textLower.includes('mañana')
      ) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueDate = tomorrow.toISOString();
      }
    }

    if (type === 'task') {
      const registerCmd = new RegisterTaskCommand(
        id,
        command.identityId,
        cleanText,
        undefined, // description
        'medium', // priority
        0, // estimatedMinutes
        dueDate,
        undefined, // commitmentId
        undefined, // goalId
        [], // tags
        command.context || {},
      );
      await this.taskAppService.registerTask(registerCmd);
    }

    // In a future sprint, other types (goal, habit, note) will have their repositories/services.
    // For now we map them or register them under task.
    return new QuickCaptureResult(id, type);
  }
}

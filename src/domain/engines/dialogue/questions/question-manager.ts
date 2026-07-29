import type { ConversationEntry } from "../types";

export type QuestionCategory =
  | "general"
  | "personal"
  | "alibi"
  | "relationship"
  | "location"
  | "evidence"
  | "timeline"
  | "motive"
  | "witness"
  | "confrontation"
  | "custom";

export interface QuestionDefinition {
  readonly id: string;
  readonly category: QuestionCategory;
  readonly text: string;
  readonly nodeId: string;
  readonly isRepeatable: boolean;
  readonly maxAsks: number;
  readonly requirements: Record<string, unknown>;
  readonly tags: string[];
}

export class QuestionManager {
  private _questions: Map<string, QuestionDefinition> = new Map();
  private _defaultCategories: QuestionCategory[] = [
    "general", "personal", "alibi", "relationship",
    "location", "evidence", "timeline", "motive",
    "witness", "confrontation",
  ];

  registerQuestion(question: QuestionDefinition): void {
    this._questions.set(question.id, question);
  }

  registerQuestions(questions: QuestionDefinition[]): void {
    for (const q of questions) {
      this._questions.set(q.id, q);
    }
  }

  getQuestion(questionId: string): QuestionDefinition | undefined {
    return this._questions.get(questionId);
  }

  getQuestionsByCategory(category: QuestionCategory): QuestionDefinition[] {
    const results: QuestionDefinition[] = [];
    for (const q of this._questions.values()) {
      if (q.category === category) {
        results.push(q);
      }
    }
    return results;
  }

  getAllQuestions(): QuestionDefinition[] {
    return Array.from(this._questions.values());
  }

  getAvailableQuestions(conversation: ConversationEntry): QuestionDefinition[] {
    return this.getAllQuestions().filter((q) =>
      conversation.unlockedQuestions.includes(q.id),
    );
  }

  isQuestionUnlocked(
    conversation: ConversationEntry,
    questionId: string,
  ): boolean {
    return conversation.unlockedQuestions.includes(questionId);
  }

  isQuestionAsked(
    conversation: ConversationEntry,
    questionId: string,
  ): boolean {
    return conversation.askedQuestions.includes(questionId);
  }

  canAskQuestion(
    conversation: ConversationEntry,
    questionId: string,
  ): boolean {
    if (!this.isQuestionUnlocked(conversation, questionId)) return false;

    const question = this._questions.get(questionId);
    if (!question) return false;

    if (!question.isRepeatable) {
      if (this.isQuestionAsked(conversation, questionId)) return false;
    }

    const askCount = conversation.askedQuestions.filter((q) => q === questionId).length;
    if (askCount >= question.maxAsks) return false;

    return true;
  }

  getCategories(): QuestionCategory[] {
    const categories = new Set<QuestionCategory>();
    for (const q of this._questions.values()) {
      categories.add(q.category);
    }
    if (categories.size === 0) {
      for (const c of this._defaultCategories) {
        categories.add(c);
      }
    }
    return Array.from(categories);
  }

  clear(): void {
    this._questions.clear();
  }
}

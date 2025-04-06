export abstract class BaseAgent {
  abstract process(input: any): Promise<any>;
  abstract validate(input: any): boolean;
  
  // Optional methods for testing
  mock?(input: any): any;
  validateOutput?(output: any): boolean;
  
  async execute(input: any) {
    console.error(`[AGENT-DEBUG] Executing ${this.constructor.name}:`, {
      input,
      timestamp: new Date().toISOString()
    });

    if (!this.validate(input)) {
      console.error(`[AGENT-ERROR] Invalid input for ${this.constructor.name}:`, {
        input,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Invalid input for ${this.constructor.name}`);
    }

    try {
      const result = await this.process(input);

      if (this.validateOutput && !this.validateOutput(result)) {
        console.error(`[AGENT-ERROR] Invalid output from ${this.constructor.name}:`, {
          result,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Invalid output from ${this.constructor.name}`);
      }

      console.error(`[AGENT-DEBUG] ${this.constructor.name} completed:`, {
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error(`[AGENT-ERROR] ${this.constructor.name} failed:`, {
        error: error instanceof Error ? error.stack : error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
} 
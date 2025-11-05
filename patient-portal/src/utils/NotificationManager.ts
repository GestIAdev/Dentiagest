// Simple NotificationManager
export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public async initialize(): Promise<boolean> {
    return true;
  }
}

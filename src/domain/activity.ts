export class Activity {
  id?: string;
  userId?: string;
  type: string;
  duration: number; // duration in minutes
  calories: number;
  timestamp: Date;  

  constructor(userId: string, type: string, duration: number, calories: number, timestamp: Date, id?: string) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.duration = duration;
    this.calories = calories;
    this.timestamp = timestamp;
  }

}

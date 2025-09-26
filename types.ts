export enum Tone {
  Professional = 'Professional',
  Casual = 'Casual',
  Empathetic = 'Empathetic',
  Humorous = 'Humorous',
  Witty = 'Witty',
  Authoritative = 'Authoritative',
}

export enum Style {
  Concise = 'Concise',
  Detailed = 'Detailed',
  Question = 'Question',
  Storytelling = 'Storytelling',
  BulletedList = 'Bulleted List',
}

export enum Action {
  Acknowledge = 'Acknowledge',
  Answer = 'Answer',
  Deescalate = 'De-escalate',
  Promote = 'Promote',
}

export enum Platform {
  Twitter = 'Twitter (X)',
  LinkedIn = 'LinkedIn',
  Instagram = 'Instagram',
  General = 'General',
}

export enum Length {
    Short = 'Short (1-2 sentences)',
    Medium = 'Medium (3-4 sentences)',
    Long = 'Long (5+ sentences)',
}

export interface ConfigOptions {
  tone: Tone;
  style: Style;
  action: Action;
  includeEmojis: boolean;
  platform: Platform;
  length: Length;
}

export interface ResponseVariation {
  title: string;
  text: string;
}

export interface GeneratedResponse {
  variations: ResponseVariation[];
  hashtags: string[];
}
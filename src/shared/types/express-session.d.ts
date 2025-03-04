import 'express-session';
import { ISessionMetadata } from './session-metadata';

declare module 'express-session' {
  interface Session {
    userId?: string;
    metadata?: ISessionMetadata;
  }
}

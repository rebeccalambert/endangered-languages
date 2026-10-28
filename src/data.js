import raw from '../dataset/endangered-languages.json';
import { prepare } from './prepare.js';

export const languages = prepare(raw);

import { Content } from './content';
import { Options } from './options';
import { LaunchResponse } from './launchResponse';
export declare function launchAsync(token: string, subdomain: string, content: Content, options?: Options): Promise<LaunchResponse>;
export declare function close(): void;
export declare function isValidSubdomain(subdomain: string): boolean;

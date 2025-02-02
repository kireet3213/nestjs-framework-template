import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { ConnectionNames } from '../../connection-names';
import { LoggingService } from '../../../services/logging/logging.service';
import { DefaultConnectionModels } from '../../model-bootstrap/default-connection-models';

@Injectable()
export class DatabaseConfigService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService) {}

  createSequelizeOptions(
    connectionName?: string,
  ): Promise<SequelizeModuleOptions> | SequelizeModuleOptions {
    connectionName = connectionName || ConnectionNames.DefaultConnection;
    const config = this.configService.get<SequelizeModuleOptions>(
      `databases.${connectionName}`,
    );

    if (!!config.logging) {
      config.logging = this.logger();
    }

    // @todo find way to auto detect models
    // add all the model classes here
    config.models = DefaultConnectionModels;

    return config;
  }

  /**
   * Returns logger function
   */
  public logger(): (sql: string, timing: number | undefined) => void {
    const logger = new LoggingService(this.configService);
    return (sql, timing) =>
      logger.debug(`Executed ${sql} Elapsed time: ${timing}`, 'DatabaseModule');
  }
}

import { Module, Global, DynamicModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MqttClient, connect } from "mqtt";
import { Logger } from "@nestjs/common";
import { MQTT_CLIENT } from "../constants";

@Global()
@Module({})
export class MqttModule {
  static register(): DynamicModule {
    const logger = new Logger("MqttModule");

    const mqttProvider = {
      provide: MQTT_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MqttClient => {
        const client = connect(
          configService.getOrThrow<string>("EMQX_MQTT_URL"),
          {
            username: configService.get("EMQX_MQTT_USER"),
            password: configService.get("EMQX_MQTT_PASSWORD"),
          },
        );

        client.on("connect", () => {
          logger.log("Connection established to EMQX MQTT.");
        });

        client.on("error", (err) => {
          logger.error("MQTT Client error:", err);
        });

        return client;
      },
    };

    return {
      module: MqttModule,
      providers: [mqttProvider],
      exports: [mqttProvider],
    };
  }
}

# Expected Output for Nodes and Edges

## Nodes

| Name                | Type          | Properties                                                                                       | Operations                              |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------- |
| ADevice             | AbstractClass | `# id: String`                                                                                   | –                                       |
| IControllable       | Interface     | –                                                                                                | `+ turnOn(): void`, `+ turnOff(): void` |
| Light               | Class         | –                                                                                                | –                                       |
| Sensor              | Class         | –                                                                                                | –                                       |
| TemperatureSensor   | Class         | `- room: Room`                                                                                   | –                                       |
| Thermostat          | Class         | –                                                                                                | `+ turnOn(): void`, `+ turnOff(): void` |
| Room                | Class         | `- name: String`, `- thermostat: Thermostat`                                                     | –                                       |
| House               | Class         | `- rooms: Room[]`                                                                                | –                                       |
| SmartHomeController | Class         | `- devices: List<ADevice>`, `- rooms: Set<Room>`, `- lightThermostatMap: Map<Light, Thermostat>` | –                                       |
| Logger              | Class         | –                                                                                                | `+ log(Room): void`                     |
| DeviceRegistry      | Class         | `- devices: List<ADevice>`                                                                       | `+ DeviceRegistry(List<ADevice>)`       |
| SensorHub           | Class         | `- sensor: Sensor`                                                                               | `+ setSensor(Sensor): void`             |
| UIManager           | Class         | –                                                                                                | `+ render(IControllable): void`         |

---

## Edges

| Type           | From → To                        | Label                | Multiplicity (from → to) |
| -------------- | -------------------------------- | -------------------- | ------------------------ |
| Generalization | Light → ADevice                  | –                    | `1..1 → 1..1`            |
| Generalization | Sensor → ADevice                 | –                    | `1..1 → 1..1`            |
| Generalization | TemperatureSensor → Sensor       | –                    | `1..1 → 1..1`            |
| Realization    | Thermostat → IControllable       | –                    | `1..1 → 1..1`            |
| Composition    | Room → Thermostat                | `thermostat`         | `1..1 → 1..1`            |
| Composition    | House → Room                     | `rooms`              | `1..1 → 0..*`            |
| Aggregation    | SmartHomeController → ADevice    | `devices`            | `1..1 → 0..*`            |
| Aggregation    | SmartHomeController → Room       | `rooms`              | `1..1 → 0..*`            |
| Aggregation    | SmartHomeController → Light      | `lightThermostatMap` | `1..1 → 1..1`            |
| Aggregation    | SmartHomeController → Thermostat | `lightThermostatMap` | `1..1 → 1..1`            |
| Aggregation    | DeviceRegistry → ADevice         | `devices`            | `1..1 → 0..*`            |
| Aggregation    | SensorHub → Sensor               | `sensor`             | `1..1 → 1..1`            |
| Association    | Logger → Room                    | `room`               | `1..1 → 1..1`            |
| Association    | UIManager → IControllable        | `controllable`       | `1..1 → 1..1`            |

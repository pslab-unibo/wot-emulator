# Web of Things Simulator

## Project Description

The **Web of Things (WoT) Simulator** is a simulator that allows you to emulate connected devices in the context of the Internet of Things (IoT) using the Web of Things model. The project enables you to insert different types of **Thing** into a specific environment and monitor and interact with their properties and actions.

Currently, the program includes two example **SituatedThing** types: **LampThing** and **Radiator**, along with a **HeatingEnv** as the environment.

### Example Things:

- **LampThing**  
    A lamp that can be turned on or off using the 'toggle' function. When on, the intensity of the light increases periodically.

- **Radiator**  
    A radiator that can be turned on or off using the 'toggle' function. When on, it increases the temperature of the environment it is placed in.

- **HeatingEnv**  
    An environment that can be heated using the `increaseTemperature(energy)` function.

In the project, the configuration file `./src/td/config.json` contains an example of a **HeatingEnv** with 2 **LampThing** (with different periods) and 2 **Radiator** (with different powers).

---

## How to Use

### 1. Configure the Paths

Before running the simulation, you need to configure the paths to the configuration file, **SituatedThing** models, and **Environment** models:

- **CONFIG**: Path to the configuration file (`config.json`).
- **THING_MODEL**: Path to the folder containing **SituatedThing** models.
- **ENV_MODEL**: Path to the folder containing **Environment** models.

Modify the variables to reflect the correct paths in your environment.

### 2. Add New **SituatedThing** or **Environment**

You can add new **SituatedThing** or new **Environment**.

### 3. Configure the `config.json` File

The `config.json` configuration file has 3 main sections:

- **"servients"**: Contains the configuration for the servients required for the simulation. Each servient must include the following keys:
  - `'id'`: Unique identifier of the servient.
  - `'type'`: The protocol type used by the servient (e.g., `http`, `mqtt`).
  
- **"environment"**: Configures the environment. The section should include:
  - `'servients: idServient'`: Specifies the servient that exposes the environment.
  - `'type'`, `'id'`, and `'title'`: Other details related to the environment.
  
- **"things"**: Contains an array of configurations for the **Things** you want to include in the environment. Each **Thing** must have:
  - `'servients: idServient'`: Specifies the servient that exposes this **Thing**.
  - `'type'`, `'id'`, and `'title'`: Details of the **Thing**.

Modify the configuration file as needed to customize the simulation.

### 4. Run the Simulation

To run the simulation, start the program from the main file (`main.ts`) using the following command:

```bash
npx ts-node src/main.ts
```
## Interacting with the Simulation

### A. Making GET Requests

GET requests allow you to retrieve the values of properties from **Things** and **Environment**. Example requests:

1. **Get the temperature of the environment**:
   ```http
   GET 'localhost:8081/heatingenv/properties/temperature'
2. **Get the power of the first radiator**:
   ```http
   GET 'localhost:8081/radiator1/properties/power'
3. **Get the intensity of the first lamp**:
   ```http
   GET 'localhost:8081/smartlamp1/properties/intensitye'
### B. Making POST Requests

POST requests allow you to interact with the **Things**, such as turning them on or off.

1. **Turn the first lamp on or off**:
   ```http
   POST 'localhost:8081/smartlamp1/actions/toggle'
2. **Turn the first radiator on or off**:
   ```http
   POST 'localhost:8081/radiator1/actions/toggle  
# Code-to-Class Diagram Tests

This directory contains unit tests for the Java code-to-UML class diagram conversion functionality.

## Test Structure

### Test File
- **`simple-unit-tests.test.ts`** - Main test file containing all unit tests for UML relationship detection

### Mock Files
All mock Java files are located in `../mock/java/` and follow a cohesive **Smart Home System** domain:

#### Core Classes
- **`Device.java`** - Abstract base class for all smart home devices
- **`Light.java`** - Concrete light class that extends Device and implements IControllable
- **`TemperatureSensor.java`** - Sensor class that extends Device and implements both IControllable and ISensor

#### Interfaces
- **`IControllable.java`** - Interface for controllable devices (turnOn, turnOff, isOn)
- **`ISensor.java`** - Interface for sensor devices (getValue, getUnit)

#### Relationship Classes
- **`Room.java`** - Contains collections of lights and sensors (composition relationships)
- **`SmartHomeController.java`** - Manages collections of devices and rooms (aggregation relationships)
- **`RemoteControl.java`** - Has a single device reference (non-collection aggregation - currently not supported)
- **`House.java`** - Contains a single room reference (non-collection composition - currently not supported)
- **`Building.java`** - Contains a collection of rooms (composition of collection)

## Test Cases

The test suite covers 8 specific UML relationship scenarios:

### 1. Simple Inheritance
- **Test**: `should detect inheritance`
- **Files**: `Device.java`, `Light.java`
- **Java**: `public class Light extends Device`
- **UML**: Generalization edge from Light to Device

### 2. Multiple Interface Realization
- **Test**: `should detect multiple interface realization`
- **Files**: `IControllable.java`, `ISensor.java`, `TemperatureSensor.java`
- **Java**: `public class TemperatureSensor extends Device implements IControllable, ISensor`
- **UML**: Two Realization edges from TemperatureSensor to both interfaces

### 3. Single Realization
- **Test**: `should detect realization`
- **Files**: `IControllable.java`, `Light.java`
- **Java**: `public class Light extends Device implements IControllable`
- **UML**: Realization edge from Light to IControllable

### 4. Multiple Realization
- **Test**: `should detect multiple interface realization` (same as #2)
- **Files**: `IControllable.java`, `ISensor.java`, `TemperatureSensor.java`
- **Java**: `public class TemperatureSensor extends Device implements IControllable, ISensor`
- **UML**: Two Realization edges

### 5. Aggregation of Non-Collection
- **Test**: `should detect aggregation of non-collection`
- **Files**: `RemoteControl.java`, `Device.java`
- **Java**: `private Device device;`
- **UML**: **No edge created** (current parser limitation)
- **Expected**: `toBeUndefined()`

### 6. Aggregation of Collection
- **Test**: `should detect aggregation of collection`
- **Files**: `SmartHomeController.java`, `Device.java`
- **Java**: `private List<Device> devices;`
- **UML**: Aggregation edge from SmartHomeController to Device
- **Expected**: `toBeDefined()`

### 7. Composition (Non-Collection)
- **Test**: `should detect composition`
- **Files**: `House.java`, `Room.java`
- **Java**: `private final Room room;`
- **UML**: **No edge created** (current parser limitation)
- **Expected**: `toBeUndefined()`

### 8. Composition of Collection
- **Test**: `should detect composition of collection`
- **Files**: `Building.java`, `Room.java`
- **Java**: `private final List<Room> rooms;`
- **UML**: Composition edge from Building to Room
- **Expected**: `toBeDefined()`

## Current Parser Limitations

The Java parser has the following limitations that are documented in the tests:

1. **Non-collection properties don't create edges**: Simple object references like `private Device device;` don't generate UML edges
2. **All collection properties are detected as Aggregation**: The parser doesn't distinguish between Aggregation and Composition for collections

## Running Tests

### Prerequisites
- Node.js and npm installed
- Dependencies installed: `npm install`

### Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

### Test Output
- ✅ **Passing tests**: All expected relationships are correctly detected
- ❌ **Failing tests**: Indicate either parser bugs or test expectation mismatches
- **Console logs**: Show detailed parsing information for debugging

## Test Architecture

### Helper Functions
- **`generateDiagram(javaFiles: string[])`**: Parses Java files and generates UML diagram
- **`findEdge(diagram, fromClass, toClass, edgeType?)`**: Finds specific edges in the diagram

### Test Pattern
Each test follows this pattern:
1. Generate diagram from specific Java files
2. Look for expected UML relationships
3. Assert that relationships exist (or don't exist for limitations)

### Mock File Organization
- **Single responsibility**: Each mock file demonstrates one specific relationship type
- **Cohesive domain**: All files belong to the Smart Home System domain
- **Minimal complexity**: Files contain only the necessary code to demonstrate relationships

## Adding New Tests

To add new test cases:

1. **Create mock Java files** in `../mock/java/` that demonstrate the relationship
2. **Add test method** in `simple-unit-tests.test.ts`
3. **Follow naming convention**: `should detect [relationship type]`
4. **Include relevant files** in `generateDiagram()` call
5. **Use `findEdge()`** to locate expected relationships
6. **Set appropriate expectations** based on parser capabilities

## Troubleshooting

### Common Issues
- **Missing mock files**: Ensure all referenced Java files exist in `../mock/java/`
- **Parser initialization**: Tests require tree-sitter Java parser to be initialized
- **Edge type mismatches**: Verify expected edge types match parser output
- **Collection vs non-collection**: Remember that only collection properties create edges

### Debugging
- Check console output for detailed parsing information
- Verify mock Java files have correct syntax
- Ensure all required classes are included in `generateDiagram()` calls

## Test File

### `simple-unit-tests.test.ts`
- **Purpose**: Individual unit tests for each UML relationship type
- **Approach**: Each test method tests one specific thing
- **Style**: Traditional unit tests like in Java/JUnit

## Test Structure

Each test method focuses on testing **one specific feature**:

```typescript
it('should detect simple inheritance (extends)', async () => {
  const diagram = await generateDiagram(['ADevice.java', 'Light.java']);
  
  const edge = findEdge(diagram, 'Light', 'ADevice', 'Generalization');
  expect(edge).toBeDefined();
  expect(edge?.type).toBe('Generalization');
});
```

## Test Categories

### 1. Inheritance Tests
- `should detect simple inheritance (extends)`
- `should detect multi-level inheritance`
- `should detect animal inheritance hierarchy`

### 2. Interface Implementation Tests
- `should detect interface implementation (implements)`
- `should detect multiple interface implementation`

### 3. Collection Property Tests
- `should detect collection composition`
- `should detect collection aggregation (currently detected as composition)`
- `should detect department-student collection relationship`

### 4. Non-Collection Property Tests
- `should NOT detect non-collection composition (current limitation)`
- `should NOT detect non-collection aggregation (current limitation)`

### 5. Node Creation Tests
- `should create nodes for all classes`
- `should create nodes with correct package names`
- `should create nodes with properties`

### 6. Edge Count Tests
- `should have correct number of edges for inheritance`
- `should have correct number of edges for interface implementation`

### 7. Current Limitations Tests
- `should document that non-collection properties create no edges`
- `should document that all collection properties are detected as Composition`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Helper Functions

The test file includes helper functions to make tests clear and readable:

```typescript
// Generate diagram from Java files
async function generateDiagram(javaFiles: string[]): Promise<Diagram>

// Find specific edge between two classes
function findEdge(diagram: Diagram, fromClass: string, toClass: string, edgeType?: string)

// Find node by class name
function findNode(diagram: Diagram, className: string)
```

## Current Implementation Status

### ✅ Working Features
- **Inheritance**: `extends` → Generalization edges
- **Interface Implementation**: `implements` → Realization edges
- **Collection Properties**: `List<T>`, `Set<T>`, arrays → Composition edges
- **Node Creation**: Classes, interfaces, enums with properties

### ❌ Current Limitations
- **Non-collection properties** don't create edges (e.g., `private Engine engine`)
- **Relationship type detection**: All collection properties detected as Composition instead of Aggregation
- **Multiple classes per file** not supported

## Adding New Tests

To add a new test:

1. **Add a new test method** in the appropriate describe block
2. **Test one specific thing** per test method
3. **Use clear, descriptive names** that explain what is being tested
4. **Use helper functions** to keep tests readable

Example:
```typescript
it('should detect public properties as associations', async () => {
  const diagram = await generateDiagram(['Teacher.java', 'Course.java']);
  
  const edge = findEdge(diagram, 'Teacher', 'Course', 'Association');
  expect(edge).toBeDefined();
});
```

## Mock Java Files

Tests use individual Java files in `../mock/java/`:
- `ADevice.java`, `Light.java`, `Sensor.java` - Inheritance
- `IControllable.java`, `Thermostat.java` - Interface implementation
- `Library.java`, `Book.java` - Collection composition
- `DeviceRegistry.java`, `Department.java` - Collection aggregation
- `Car.java`, `Engine.java` - Non-collection composition (limitation)
- `University.java`, `Professor.java` - Non-collection aggregation (limitation) 
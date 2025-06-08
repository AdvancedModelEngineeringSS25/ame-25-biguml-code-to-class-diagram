package mock.java;

public class IntegrationTest {
    private Logger logger = new Logger(); // Composition?

    public void test(Room room, Thermostat thermostat) { // Association
        logger.log(room);
        thermostat.turnOn();
    }
}

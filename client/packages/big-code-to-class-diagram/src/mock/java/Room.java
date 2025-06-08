package mock.java;

public class Room implements IControllable, ISecondInterface {
    private String name;
    private Thermostat thermostat = new Thermostat(); // Composition

    @Override
    public void turnOn() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'turnOn'");
    }

    @Override
    public void turnOff() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'turnOff'");
    }
}

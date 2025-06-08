package mock.java;

import java.util.List;

public class DeviceRegistry {
    private List<ADevice> devices;

    public DeviceRegistry(List<ADevice> devices) { // Aggregation
        this.devices = devices;
    }
}

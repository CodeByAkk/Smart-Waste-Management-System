package com.smartwaste.service;

import com.smartwaste.entity.*;
import com.smartwaste.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CityLocationRepository cityLocationRepository;
    private final RoadConnectionRepository roadConnectionRepository;
    private final DustbinRepository dustbinRepository;
    private final VehicleRepository vehicleRepository;
    private final CollectionStaffRepository staffRepository;
    private final ComplaintRepository complaintRepository;
    private final CollectionHistoryRepository historyRepository;
    private final PriorityService priorityService;
    private final RouteOptimizationService routeOptimizationService;

    public DataInitializationService(UserRepository userRepository,
                                   CityLocationRepository cityLocationRepository,
                                   RoadConnectionRepository roadConnectionRepository,
                                   DustbinRepository dustbinRepository,
                                   VehicleRepository vehicleRepository,
                                   CollectionStaffRepository staffRepository,
                                   ComplaintRepository complaintRepository,
                                   CollectionHistoryRepository historyRepository,
                                   PriorityService priorityService,
                                   RouteOptimizationService routeOptimizationService) {
        this.userRepository = userRepository;
        this.cityLocationRepository = cityLocationRepository;
        this.roadConnectionRepository = roadConnectionRepository;
        this.dustbinRepository = dustbinRepository;
        this.vehicleRepository = vehicleRepository;
        this.staffRepository = staffRepository;
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.priorityService = priorityService;
        this.routeOptimizationService = routeOptimizationService;
    }

    @Override
    public void run(String... args) throws Exception {
        if (dustbinRepository.count() > 0) {
            // Already initialized
            return;
        }

        // 1. Seed Users for 3 Roles: Admin, Staff, Public
        seedUsers();

        // 2. Seed City Locations (Depots, Intersections, Landfill)
        seedCityLocations();

        // 3. Seed City Road Connections (Adjacency List Weighted Graph)
        seedRoadConnections();

        // 4. Seed Vehicles (At least 5)
        seedVehicles();

        // 5. Seed Staff Members (At least 8)
        seedStaff();

        // 6. Seed Dustbins (At least 30)
        seedDustbins();

        // 7. Seed Complaints (At least 6)
        seedComplaints();

        // 8. Seed Collection History (At least 12)
        seedCollectionHistory();

        // 9. Rebuild DSA Priority Heap & City Graph
        priorityService.rebuildHeap();
        routeOptimizationService.reloadGraph();
    }

    private void seedUsers() {
        userRepository.saveAll(Arrays.asList(
                new User("admin", "admin123", "Dr. Rajesh Sharma (Municipal Admin)", "admin@smartwaste.gov.in", "+91 98220 11001", User.Role.ADMIN),
                new User("staff1", "staff123", "Sunil Pawar (Zone A Lead)", "sunil.pawar@smartwaste.gov.in", "+91 98220 22002", User.Role.STAFF),
                new User("staff2", "staff123", "Ramesh Kulkarni (Zone B Driver)", "ramesh.k@smartwaste.gov.in", "+91 98220 33003", User.Role.STAFF),
                new User("citizen", "citizen123", "Pooja Deshmukh (Resident)", "pooja.d@citizenmail.com", "+91 98220 44004", User.Role.PUBLIC)
        ));
    }

    private void seedCityLocations() {
        cityLocationRepository.saveAll(Arrays.asList(
                new CityLocation("DEPOT-01", "Central Municipal Solid Waste Depot", 18.5204, 73.8567, CityLocation.LocationType.DEPOT, "Primary fleet dispatch & maintenance hub"),
                new CityLocation("DEPOT-02", "North Ward Transfer Station", 18.5520, 73.8290, CityLocation.LocationType.DEPOT, "North secondary sorting & compactor yard"),
                new CityLocation("INT-01", "Shivaji Nagar Interchange", 18.5308, 73.8474, CityLocation.LocationType.INTERSECTION, "Major transport and commercial crossroads"),
                new CityLocation("INT-02", "FC Road Junction", 18.5186, 73.8415, CityLocation.LocationType.INTERSECTION, "College & commercial district gateway"),
                new CityLocation("INT-03", "JM Road Square", 18.5235, 73.8480, CityLocation.LocationType.INTERSECTION, "Central commercial spine crossing"),
                new CityLocation("INT-04", "Swargate Transport Hub", 18.5018, 73.8586, CityLocation.LocationType.INTERSECTION, "South city bus terminus & major corridor"),
                new CityLocation("INT-05", "Pune Railway Station Circle", 18.5284, 73.8744, CityLocation.LocationType.INTERSECTION, "East central transit convergence"),
                new CityLocation("INT-06", "Koregaon Park Gateway", 18.5362, 73.8940, CityLocation.LocationType.INTERSECTION, "High-density residential & restaurant sector"),
                new CityLocation("INT-07", "Kothrud Paud Phata", 18.5074, 73.8188, CityLocation.LocationType.INTERSECTION, "Western residential artery"),
                new CityLocation("INT-08", "Aundh University Chowk", 18.5492, 73.8252, CityLocation.LocationType.INTERSECTION, "North-West university corridor junction"),
                new CityLocation("INT-09", "Camp MG Road Cross", 18.5135, 73.8789, CityLocation.LocationType.INTERSECTION, "Cantonment & market retail node"),
                new CityLocation("INT-10", "Hadapsar Industrial Gate", 18.5020, 73.9260, CityLocation.LocationType.INTERSECTION, "South-East industrial sector connection"),
                new CityLocation("LANDFILL-01", "Uruli Devachi Eco-Park & Landfill", 18.4800, 73.9500, CityLocation.LocationType.LANDFILL, "Main municipal waste processing plant")
        ));
    }

    private void seedRoadConnections() {
        roadConnectionRepository.saveAll(Arrays.asList(
                // Central connections
                new RoadConnection("DEPOT-01", "INT-01", 1.8, "Old Pune-Mumbai Highway", true),
                new RoadConnection("DEPOT-01", "INT-03", 1.2, "Congress Bhavan Road", true),
                new RoadConnection("DEPOT-01", "INT-05", 2.1, "Dr. Ambedkar Road", true),
                new RoadConnection("INT-01", "INT-02", 1.9, "Fergusson College Link", true),
                new RoadConnection("INT-01", "INT-08", 3.2, "Ganeshkhind Road", true),
                new RoadConnection("INT-02", "INT-03", 0.9, "Modern High School Road", true),
                new RoadConnection("INT-02", "INT-07", 3.4, "Karve Road Expressway", true),
                new RoadConnection("INT-03", "INT-04", 2.6, "Bajirao Road Arterial", true),
                new RoadConnection("INT-04", "INT-09", 2.8, "Shankarsheth Road", true),
                new RoadConnection("INT-05", "INT-06", 2.7, "Koregaon Park Main Road", true),
                new RoadConnection("INT-05", "INT-09", 2.0, "Moledina Road", true),
                new RoadConnection("INT-06", "INT-10", 4.5, "Mundhwa Bypass", true),
                new RoadConnection("INT-08", "DEPOT-02", 1.1, "Aundh Depot Approach", true),
                new RoadConnection("INT-09", "INT-10", 5.1, "Solapur Highway Link", true),
                new RoadConnection("INT-10", "LANDFILL-01", 3.8, "Uruli Processing Bypass", true),
                new RoadConnection("INT-04", "LANDFILL-01", 6.2, "South Industrial Ring Road", true)
        ));
    }

    private void seedVehicles() {
        vehicleRepository.saveAll(Arrays.asList(
                new Vehicle("MH-12-GW-9001", "Heavy Hydraulic Compactor", 4500.0, "Central Municipal Solid Waste Depot", 18.5204, 73.8567, "Ganesh Shinde", Vehicle.Status.AVAILABLE),
                new Vehicle("MH-12-GW-9002", "Medium Compactor Truck", 3500.0, "North Ward Transfer Station", 18.5520, 73.8290, "Ramesh Kulkarni", Vehicle.Status.AVAILABLE),
                new Vehicle("MH-12-GW-9003", "Mini Tipper Truck", 1800.0, "Shivaji Nagar Interchange", 18.5308, 73.8474, "Vijay Jadhav", Vehicle.Status.AVAILABLE),
                new Vehicle("MH-12-GW-9004", "Electric Waste Carrier", 1200.0, "Koregaon Park Gateway", 18.5362, 73.8940, "Amit Patil", Vehicle.Status.ON_DUTY),
                new Vehicle("MH-12-GW-9005", "Heavy Hydraulic Compactor", 5000.0, "Swargate Transport Hub", 18.5018, 73.8586, "Dinesh More", Vehicle.Status.AVAILABLE),
                new Vehicle("MH-12-GW-9006", "Rapid Response Van", 1500.0, "Camp MG Road Cross", 18.5135, 73.8789, "Sachin Gaikwad", Vehicle.Status.MAINTENANCE)
        ));
    }

    private void seedStaff() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        staffRepository.saveAll(Arrays.asList(
                new CollectionStaff("STF-101", "Sunil Pawar", "+91 98220 22002", vehicles.get(0), CollectionStaff.WorkingStatus.ACTIVE),
                new CollectionStaff("STF-102", "Ramesh Kulkarni", "+91 98220 33003", vehicles.get(1), CollectionStaff.WorkingStatus.ACTIVE),
                new CollectionStaff("STF-103", "Vijay Jadhav", "+91 98220 44005", vehicles.get(2), CollectionStaff.WorkingStatus.ACTIVE),
                new CollectionStaff("STF-104", "Amit Patil", "+91 98220 55006", vehicles.get(3), CollectionStaff.WorkingStatus.BUSY),
                new CollectionStaff("STF-105", "Dinesh More", "+91 98220 66007", vehicles.get(4), CollectionStaff.WorkingStatus.ACTIVE),
                new CollectionStaff("STF-106", "Sachin Gaikwad", "+91 98220 77008", null, CollectionStaff.WorkingStatus.ON_LEAVE),
                new CollectionStaff("STF-107", "Mahesh Thorat", "+91 98220 88009", vehicles.get(0), CollectionStaff.WorkingStatus.ACTIVE),
                new CollectionStaff("STF-108", "Prakash Salunke", "+91 98220 99010", vehicles.get(1), CollectionStaff.WorkingStatus.ACTIVE)
        ));
    }

    private void seedDustbins() {
        // Seed 32 realistic smart dustbins across Pune city zones
        Object[][] rawBins = new Object[][]{
                // Code, Location, Lat, Lon, Capacity, FillPct, Category
                {"B101", "FC Road Commercial Arcade, Shivaji Nagar", 18.5195, 73.8420, 600.0, 95, Dustbin.Category.GENERAL},
                {"B102", "JM Road Public Garden, Deccan", 18.5240, 73.8475, 500.0, 45, Dustbin.Category.ORGANIC},
                {"B103", "Pune Central Mall Plaza, Shivaji Nagar", 18.5320, 73.8490, 800.0, 82, Dustbin.Category.RECYCLABLE},
                {"B104", "Swargate Metro Bus Stand, Swargate", 18.5025, 73.8590, 1000.0, 100, Dustbin.Category.GENERAL},
                {"B105", "Sarasbaug Entrance Gate, Swargate", 18.5060, 73.8540, 500.0, 30, Dustbin.Category.ORGANIC},
                {"B106", "Koregaon Park North Main Road, Koregaon Park", 18.5370, 73.8960, 600.0, 76, Dustbin.Category.RECYCLABLE},
                {"B107", "Osho Garden Perimeter, Koregaon Park", 18.5395, 73.8985, 450.0, 25, Dustbin.Category.ORGANIC},
                {"B108", "Pune Railway Station Platform 1 Exit, Central", 18.5288, 73.8750, 1200.0, 92, Dustbin.Category.GENERAL},
                {"B109", "Camp MG Road Shopping Corner, Camp", 18.5140, 73.8800, 700.0, 88, Dustbin.Category.GENERAL},
                {"B110", "East Street Food Market, Camp", 18.5120, 73.8820, 600.0, 94, Dustbin.Category.ORGANIC},
                {"B111", "Aundh ITI Road Square, Aundh", 18.5510, 73.8260, 600.0, 58, Dustbin.Category.RECYCLABLE},
                {"B112", "Westend Mall Forecourt, Aundh", 18.5540, 73.8240, 900.0, 91, Dustbin.Category.GENERAL},
                {"B113", "Kothrud Stand Market, Kothrud", 18.5080, 73.8170, 650.0, 78, Dustbin.Category.ORGANIC},
                {"B114", "MIT College Road, Kothrud", 18.5160, 73.8140, 500.0, 62, Dustbin.Category.GENERAL},
                {"B115", "Hadapsar Vegetable Mandi, Hadapsar", 18.5030, 73.9280, 1000.0, 97, Dustbin.Category.ORGANIC},
                {"B116", "Magarpatta City North Gate, Hadapsar", 18.5145, 73.9310, 800.0, 35, Dustbin.Category.ELECTRONIC},
                {"B117", "Fergusson College Main Gate, Shivaji Nagar", 18.5210, 73.8400, 500.0, 84, Dustbin.Category.RECYCLABLE},
                {"B118", "Sambhajiraje Chhatrapati Park, JM Road", 18.5265, 73.8495, 450.0, 15, Dustbin.Category.ORGANIC},
                {"B119", "Ruby Hall Clinic Medical Block, Central", 18.5315, 73.8770, 600.0, 79, Dustbin.Category.HAZARDOUS},
                {"B120", "Jehangir Hospital Corner, Central", 18.5300, 73.8740, 500.0, 86, Dustbin.Category.HAZARDOUS},
                {"B121", "Laxmi Road Textile Market, Old City", 18.5170, 73.8550, 750.0, 96, Dustbin.Category.GENERAL},
                {"B122", "Tulsi Baug Traditional Market, Old City", 18.5160, 73.8540, 600.0, 89, Dustbin.Category.GENERAL},
                {"B123", "Shaniwar Wada Historical Fort, Old City", 18.5195, 73.8555, 700.0, 72, Dustbin.Category.RECYCLABLE},
                {"B124", "University of Pune Main Circle, Aundh", 18.5525, 73.8295, 500.0, 20, Dustbin.Category.ORGANIC},
                {"B125", "Bremen Square Public Walkway, Aundh", 18.5580, 73.8220, 550.0, 65, Dustbin.Category.GENERAL},
                {"B126", "Kalyani Nagar Joggers Park, East", 18.5460, 73.9020, 450.0, 40, Dustbin.Category.ORGANIC},
                {"B127", "Phoenix Marketcity Mall Transit Point, Viman Nagar", 18.5620, 73.9160, 1100.0, 93, Dustbin.Category.GENERAL},
                {"B128", "Deccan Gymkhana Sports Complex, Deccan", 18.5150, 73.8430, 500.0, 52, Dustbin.Category.RECYCLABLE},
                {"B129", "Model Colony Deep Bungalow Chowk, Shivaji Nagar", 18.5340, 73.8370, 500.0, 71, Dustbin.Category.GENERAL},
                {"B130", "Bavdhan Expressway Entry, West", 18.5120, 73.7850, 600.0, 81, Dustbin.Category.GENERAL},
                {"B131", "Katraj Snake Park Bus Stand, South", 18.4550, 73.8620, 800.0, 68, Dustbin.Category.ORGANIC},
                {"B132", "Shivaji Market Fish & Poultry Sector, Camp", 18.5105, 73.8795, 950.0, 98, Dustbin.Category.ORGANIC}
        };

        for (Object[] row : rawBins) {
            String code = (String) row[0];
            String loc = (String) row[1];
            Double lat = (Double) row[2];
            Double lon = (Double) row[3];
            Double cap = (Double) row[4];
            Integer fill = (Integer) row[5];
            Dustbin.Category cat = (Dustbin.Category) row[6];

            Dustbin bin = new Dustbin(code, loc, lat, lon, cap, fill, cat);
            bin.setInstallationDate(LocalDate.now().minusMonths(6));
            bin.setLastCollectionDate(LocalDateTime.now().minusDays(fill > 70 ? 2 : 1));
            bin.setAssignedStaffName("Sunil Pawar");
            dustbinRepository.save(bin);
        }
    }

    private void seedComplaints() {
        complaintRepository.saveAll(Arrays.asList(
                new Complaint("CMP-849201", "Pooja Deshmukh", "+91 98220 44004", Complaint.Category.OVERFLOWING, "FC Road near Cafe Goodluck, Shivaji Nagar", 18.5190, 73.8418, "Dustbin B101 is overflowing onto the pedestrian pathway. Foul smell and stray dogs congregating.", "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600"),
                new Complaint("CMP-849202", "Anand Kute", "+91 98220 55112", Complaint.Category.GARBAGE_NOT_COLLECTED, "Swargate Metro Exit 2, Swargate", 18.5022, 73.8588, "Garbage collection truck hasn't visited this corner for two consecutive days. Bins are packed completely.", "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600"),
                new Complaint("CMP-849203", "Meera Nair", "+91 98220 66223", Complaint.Category.DAMAGED_DUSTBIN, "Koregaon Park Lane 5 Corner", 18.5365, 73.8950, "The lid hinges of the recyclable bin are broken and wheels detached.", null),
                new Complaint("CMP-849204", "Vikram Joshi", "+91 98220 77334", Complaint.Category.ILLEGAL_DUMPING, "Hadapsar Canal Road near Industrial Gate", 18.5028, 73.9275, "Commercial waste dumped beside the street instead of designated bin area.", "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600"),
                new Complaint("CMP-849205", "Tanvi Shinde", "+91 98220 88445", Complaint.Category.UNCLEAN_PUBLIC_AREA, "Laxmi Road Market Square", 18.5168, 73.8548, "Market sweepings piled up near vegetable stalls after evening closing.", null),
                new Complaint("CMP-849206", "Dr. Sameer Roy", "+91 98220 99556", Complaint.Category.OVERFLOWING, "Ruby Hall Clinic Medical Block Corner", 18.5310, 73.8765, "Hazardous waste bin needs urgent evacuation due to high hospital patient footfall.", null)
        ));
    }

    private void seedCollectionHistory() {
        LocalDateTime now = LocalDateTime.now();
        historyRepository.saveAll(Arrays.asList(
                new CollectionHistory("COL-7701", 1L, "B101", 1L, "Sunil Pawar", 1L, "MH-12-GW-9001", 96, 260.0),
                new CollectionHistory("COL-7702", 4L, "B104", 1L, "Sunil Pawar", 1L, "MH-12-GW-9001", 100, 450.0),
                new CollectionHistory("COL-7703", 8L, "B108", 2L, "Ramesh Kulkarni", 2L, "MH-12-GW-9002", 95, 520.0),
                new CollectionHistory("COL-7704", 10L, "B110", 2L, "Ramesh Kulkarni", 2L, "MH-12-GW-9002", 90, 270.0),
                new CollectionHistory("COL-7705", 12L, "B112", 3L, "Vijay Jadhav", 3L, "MH-12-GW-9003", 88, 360.0),
                new CollectionHistory("COL-7706", 15L, "B115", 4L, "Amit Patil", 4L, "MH-12-GW-9004", 94, 420.0),
                new CollectionHistory("COL-7707", 21L, "B121", 1L, "Sunil Pawar", 1L, "MH-12-GW-9001", 92, 340.0),
                new CollectionHistory("COL-7708", 22L, "B122", 1L, "Sunil Pawar", 1L, "MH-12-GW-9001", 85, 255.0),
                new CollectionHistory("COL-7709", 27L, "B127", 5L, "Dinesh More", 5L, "MH-12-GW-9005", 98, 480.0),
                new CollectionHistory("COL-7710", 32L, "B132", 5L, "Dinesh More", 5L, "MH-12-GW-9005", 95, 430.0),
                new CollectionHistory("COL-7711", 3L, "B103", 2L, "Ramesh Kulkarni", 2L, "MH-12-GW-9002", 80, 290.0),
                new CollectionHistory("COL-7712", 9L, "B109", 3L, "Vijay Jadhav", 3L, "MH-12-GW-9003", 85, 275.0)
        ));
    }
}

-- Prototype catalog for local testing. Accounts, bookings and notifications are omitted.
insert into public.locations
select * from jsonb_populate_recordset(null::public.locations, $catalog$
[
  {
    "id": "LT",
    "name": "Lecture Theatres Complex",
    "category": "Lecture Complex",
    "description": "Tiered modern lecture theatres equipped with full AV and digital podiums.",
    "totalRooms": 4
  },
  {
    "id": "LP",
    "name": "Library Plaza & Amphitheatre",
    "category": "Common",
    "description": "Central outdoor open plaza, amphitheatre steps, and green lawns.",
    "totalRooms": 3
  },
  {
    "id": "TAN",
    "name": "TAN Activity Centre",
    "category": "Common",
    "description": "Rehearsal spaces, acoustic rooms, and student activity centers.",
    "totalRooms": 3
  },
  {
    "id": "B Block",
    "name": "B Block Academic Wing",
    "category": "Academic",
    "description": "Core engineering classrooms, conference rooms, and tutorial halls.",
    "totalRooms": 5
  },
  {
    "id": "C Block",
    "name": "C Block Academic Wing",
    "category": "Academic",
    "description": "Computer Science and modern presentation-enabled interactive smart rooms.",
    "totalRooms": 4
  },
  {
    "id": "D Block",
    "name": "D Block Academic Wing",
    "category": "Academic",
    "description": "Spacious lecture classrooms with projector setups and audio system.",
    "totalRooms": 3
  },
  {
    "id": "E Block",
    "name": "E Block Academic Wing",
    "category": "Academic",
    "description": "Faculty and seminar rooms suitable for focused technical sessions.",
    "totalRooms": 3
  },
  {
    "id": "F Block",
    "name": "F Block Academic Wing",
    "category": "Academic",
    "description": "Seminar rooms and department lecture halls with high-speed campus LAN.",
    "totalRooms": 3
  },
  {
    "id": "Main Auditorium",
    "name": "Main Campus Auditorium",
    "category": "Auditorium",
    "description": "Premier 1,500-seat university auditorium with acoustic and stage lighting.",
    "totalRooms": 3
  },
  {
    "id": "GR1",
    "name": "Green Reservation 1 (North Grounds)",
    "category": "Outdoor / Grounds",
    "description": "Expansive open ground for outdoor festivals, stalls, and exhibitions.",
    "totalRooms": 2
  },
  {
    "id": "GR2",
    "name": "Green Reservation 2 (Sports Pavilion)",
    "category": "Outdoor / Grounds",
    "description": "Athletics and sports ground space for rallies and large gatherings.",
    "totalRooms": 2
  },
  {
    "id": "CR",
    "name": "Central Conference & Common Room",
    "category": "Common",
    "description": "Executive conference tables, teleconferencing unit, and AC lounges.",
    "totalRooms": 2
  }
]
$catalog$)
on conflict (id) do nothing;

insert into public.resources
select * from jsonb_populate_recordset(null::public.resources, $catalog$
[
  {
    "id": "LT-101",
    "name": "LT-101 (Tiered Lecture Hall)",
    "locationId": "LT",
    "capacity": 280,
    "type": "Lecture Hall",
    "facilities": [
      "Dual Projectors",
      "Wireless Mic",
      "AC",
      "Tiered Seating",
      "Podium"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "LT-102",
    "name": "LT-102 (Lecture Theatre)",
    "locationId": "LT",
    "capacity": 200,
    "type": "Lecture Hall",
    "facilities": [
      "Projector",
      "Sound System",
      "AC",
      "Tiered Seating"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "LT-201",
    "name": "LT-201 (Smart Seminar Theatre)",
    "locationId": "LT",
    "capacity": 150,
    "type": "Lecture Hall",
    "facilities": [
      "Smart Interactive Board",
      "AC",
      "Mic System",
      "LAN Ports"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "LT-202",
    "name": "LT-202 (Lecture Theatre)",
    "locationId": "LT",
    "capacity": 150,
    "type": "Lecture Hall",
    "facilities": [
      "Projector",
      "AC",
      "Mic System"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "LP-101",
    "name": "LP-101 Amphitheatre Stage",
    "locationId": "LP",
    "capacity": 400,
    "type": "Open Space",
    "facilities": [
      "Outdoor Power Outlets",
      "Stepped Stone Seating",
      "Ambient Floodlights"
    ],
    "status": "Available",
    "floor": "Ground Level"
  },
  {
    "id": "LP-Lawn-N",
    "name": "LP North Plaza Lawn",
    "locationId": "LP",
    "capacity": 250,
    "type": "Open Space",
    "facilities": [
      "Grass Lawn",
      "Open Air Setup Allowed",
      "Evening Lighting"
    ],
    "status": "Available",
    "floor": "Ground Level"
  },
  {
    "id": "LP-Lawn-S",
    "name": "LP South Canopy Area",
    "locationId": "LP",
    "capacity": 180,
    "type": "Open Space",
    "facilities": [
      "Canopy Shade",
      "Outdoor Benches"
    ],
    "status": "Unavailable",
    "floor": "Ground Level"
  },
  {
    "id": "TAN-01",
    "name": "TAN-01 Dance & Cultural Studio",
    "locationId": "TAN",
    "capacity": 80,
    "type": "Meeting Room",
    "facilities": [
      "Wall Mirrors",
      "Wooden Flooring",
      "High-Bass Audio Unit",
      "AC"
    ],
    "status": "Available",
    "floor": "Basement"
  },
  {
    "id": "TAN-02",
    "name": "TAN-02 Dramatics Rehearsal Hall",
    "locationId": "TAN",
    "capacity": 70,
    "type": "Meeting Room",
    "facilities": [
      "Acoustic Paneling",
      "Blackout Curtains",
      "Rehearsal Risers"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "TAN-Media",
    "name": "TAN Student Media Hub",
    "locationId": "TAN",
    "capacity": 45,
    "type": "Meeting Room",
    "facilities": [
      "Editing Workstations",
      "Green Screen Backdrop",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "B-101",
    "name": "B-101 General Lecture Room",
    "locationId": "B Block",
    "capacity": 90,
    "type": "Classroom",
    "facilities": [
      "Projector",
      "Whiteboard",
      "Ceiling Fans",
      "Podium"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "B-102",
    "name": "B-102 Smart Classroom",
    "locationId": "B Block",
    "capacity": 85,
    "type": "Classroom",
    "facilities": [
      "Interactive Screen",
      "AC",
      "Soundbar"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "B-201",
    "name": "B-201 Department Seminar Hall",
    "locationId": "B Block",
    "capacity": 120,
    "type": "Lecture Hall",
    "facilities": [
      "High-Lumens Projector",
      "AC",
      "Conference Mic",
      "Wi-Fi 6"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "B-204",
    "name": "B-204 Large Tutorial Room",
    "locationId": "B Block",
    "capacity": 75,
    "type": "Classroom",
    "facilities": [
      "Double Whiteboards",
      "Projector",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "B-305",
    "name": "B-305 Meeting Room",
    "locationId": "B Block",
    "capacity": 35,
    "type": "Meeting Room",
    "facilities": [
      "Roundtable",
      "4K Display",
      "Video Conferencing",
      "AC"
    ],
    "status": "Available",
    "floor": "Second Floor"
  },
  {
    "id": "C-101",
    "name": "C-101 Computer Science Seminar Hall",
    "locationId": "C Block",
    "capacity": 130,
    "type": "Lecture Hall",
    "facilities": [
      "Dual Displays",
      "AC",
      "Laptop Power Hubs",
      "Audio Console"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "C-102",
    "name": "C-102 Coding Lab & Workshop Room",
    "locationId": "C Block",
    "capacity": 70,
    "type": "Classroom",
    "facilities": [
      "LAN Cables",
      "High-Speed Wi-Fi",
      "Smart Board",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "C-201",
    "name": "C-201 Multi-purpose Class Hall",
    "locationId": "C Block",
    "capacity": 90,
    "type": "Classroom",
    "facilities": [
      "Projector",
      "Whiteboard",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "C-205",
    "name": "C-205 Student Innovation Studio",
    "locationId": "C Block",
    "capacity": 40,
    "type": "Meeting Room",
    "facilities": [
      "Whiteboard Walls",
      "Modular Chairs",
      "AC",
      "TV Monitor"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "D-101",
    "name": "D-101 Engineering Hall",
    "locationId": "D Block",
    "capacity": 100,
    "type": "Classroom",
    "facilities": [
      "Projector",
      "Sound System",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "D-102",
    "name": "D-102 Tutorial Room",
    "locationId": "D Block",
    "capacity": 60,
    "type": "Classroom",
    "facilities": [
      "Whiteboard",
      "Ceiling Projector"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "D-203",
    "name": "D-203 Audio-Visual Room",
    "locationId": "D Block",
    "capacity": 80,
    "type": "Lecture Hall",
    "facilities": [
      "Surround Audio",
      "HD Projector",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "E-101",
    "name": "E-101 Presentation Hall",
    "locationId": "E Block",
    "capacity": 95,
    "type": "Classroom",
    "facilities": [
      "Digital Podium",
      "Projector",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "E-104",
    "name": "E-104 Discussion Room",
    "locationId": "E Block",
    "capacity": 40,
    "type": "Meeting Room",
    "facilities": [
      "Whiteboard",
      "Flat Screen TV",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "E-202",
    "name": "E-202 Seminar Suite",
    "locationId": "E Block",
    "capacity": 70,
    "type": "Lecture Hall",
    "facilities": [
      "Projector",
      "Wireless Mic",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "F-101",
    "name": "F-101 Large Lecture Theatre",
    "locationId": "F Block",
    "capacity": 140,
    "type": "Lecture Hall",
    "facilities": [
      "Tiered Seating",
      "Dual Projector",
      "AC",
      "Mic System"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "F-102",
    "name": "F-102 Tutorial Studio",
    "locationId": "F Block",
    "capacity": 55,
    "type": "Classroom",
    "facilities": [
      "Whiteboard",
      "Projector",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "F-201",
    "name": "F-201 Departmental Hall",
    "locationId": "F Block",
    "capacity": 90,
    "type": "Lecture Hall",
    "facilities": [
      "Sound System",
      "Projector",
      "AC"
    ],
    "status": "Available",
    "floor": "First Floor"
  },
  {
    "id": "AUDI-MAIN",
    "name": "Main Auditorium Grand Hall",
    "locationId": "Main Auditorium",
    "capacity": 1500,
    "type": "Auditorium",
    "facilities": [
      "Motorized Main Stage",
      "Theatrical Lighting Grid",
      "High-Power Acoustic System",
      "Central AC",
      "Live Stream Console",
      "Dual Green Rooms"
    ],
    "status": "Available",
    "floor": "Ground & Balcony"
  },
  {
    "id": "AUDI-STAGE",
    "name": "Auditorium Stage & Backstage Area",
    "locationId": "Main Auditorium",
    "capacity": 100,
    "type": "Open Space",
    "facilities": [
      "Stage Rigging",
      "Dressing Rooms",
      "Props Storage"
    ],
    "status": "Available",
    "floor": "Stage Level"
  },
  {
    "id": "AUDI-VIP",
    "name": "VIP Guest & Speaker Green Lounge",
    "locationId": "Main Auditorium",
    "capacity": 30,
    "type": "Meeting Room",
    "facilities": [
      "Sofa Seating",
      "Restrooms",
      "Pantry Access",
      "AC"
    ],
    "status": "Available",
    "floor": "Backstage Mezzanine"
  },
  {
    "id": "GR1-NORTH",
    "name": "GR1 North Festival Lawn",
    "locationId": "GR1",
    "capacity": 1000,
    "type": "Open Space",
    "facilities": [
      "Open Field",
      "Water Source Access",
      "Heavy Rigging Access"
    ],
    "status": "Available",
    "floor": "Ground Area"
  },
  {
    "id": "GR1-STAGE",
    "name": "GR1 Semi-Covered Stage Platform",
    "locationId": "GR1",
    "capacity": 250,
    "type": "Open Space",
    "facilities": [
      "Concrete Elevated Stage",
      "Three-phase Industrial Power"
    ],
    "status": "Available",
    "floor": "Ground Area"
  },
  {
    "id": "GR2-PAVILION",
    "name": "GR2 Sports Pavilion & Track Field",
    "locationId": "GR2",
    "capacity": 800,
    "type": "Open Space",
    "facilities": [
      "Grandstand Seating",
      "Field Floodlights",
      "PA Announce Box"
    ],
    "status": "Available",
    "floor": "Ground Area"
  },
  {
    "id": "GR2-CLUB",
    "name": "GR2 Sports Clubhouse Hall",
    "locationId": "GR2",
    "capacity": 80,
    "type": "Meeting Room",
    "facilities": [
      "Indoor Seating",
      "Fans",
      "Equipment Storage"
    ],
    "status": "Available",
    "floor": "Pavilion Ground"
  },
  {
    "id": "CR-A",
    "name": "CR-A Executive Board Conference Room",
    "locationId": "CR",
    "capacity": 50,
    "type": "Meeting Room",
    "facilities": [
      "Executive Wood Table",
      "Cisco Telepresence",
      "AC",
      "Mics per seat"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  },
  {
    "id": "CR-B",
    "name": "CR-B Student Representative Hall",
    "locationId": "CR",
    "capacity": 65,
    "type": "Meeting Room",
    "facilities": [
      "U-Shape Seating",
      "Projector",
      "Sound Bar",
      "AC"
    ],
    "status": "Available",
    "floor": "Ground Floor"
  }
]
$catalog$)
on conflict (id) do nothing;

insert into public.societies
select * from jsonb_populate_recordset(null::public.societies, $catalog$
[
  {
    "id": "soc-ieee",
    "name": "IEEE Student Branch",
    "code": "IEEE",
    "category": "Technical",
    "leadName": "Aayati Sharma",
    "leadEmail": "aayati.sharma@thapar.edu",
    "memberCount": 240,
    "description": "Fostering technological innovation and excellence for the benefit of humanity.",
    "facultyAdvisor": "Dr. Neeraj Kumar"
  },
  {
    "id": "soc-csi",
    "name": "Computer Society of India (CSI)",
    "code": "CSI",
    "category": "Technical",
    "leadName": "Rohan Mehra",
    "leadEmail": "rohan.mehra@thapar.edu",
    "memberCount": 190,
    "description": "Dedicated to computing advancement, programming hackathons, and tech talks.",
    "facultyAdvisor": "Dr. Rajesh Khanna"
  },
  {
    "id": "soc-edc",
    "name": "Entrepreneurship Development Cell (EDC)",
    "code": "EDC",
    "category": "Entrepreneurship",
    "leadName": "Kabir Singhal",
    "leadEmail": "kabir.singhal@thapar.edu",
    "memberCount": 160,
    "description": "Promoting startup culture, investor pitch fests, and entrepreneurship summits.",
    "facultyAdvisor": "Dr. Sanjeev Sharma"
  },
  {
    "id": "soc-sae",
    "name": "Society of Automotive Engineers (SAE)",
    "code": "SAE",
    "category": "Technical",
    "leadName": "Amanpreet Singh",
    "leadEmail": "amanpreet.singh@thapar.edu",
    "memberCount": 145,
    "description": "Designing and manufacturing Formula Student, Baja, and solar prototype vehicles.",
    "facultyAdvisor": "Dr. Tarun Kumar"
  },
  {
    "id": "soc-iste",
    "name": "Indian Society for Technical Education (ISTE)",
    "code": "ISTE",
    "category": "Technical",
    "leadName": "Diya Verma",
    "leadEmail": "diya.verma@thapar.edu",
    "memberCount": 175,
    "description": "Conducting national level tech symposiums, workshops, and career masterclasses.",
    "facultyAdvisor": "Dr. Amit Kohli"
  },
  {
    "id": "soc-acm",
    "name": "ACM Student Chapter",
    "code": "ACM",
    "category": "Technical",
    "leadName": "Siddharth Roy",
    "leadEmail": "siddharth.roy@thapar.edu",
    "memberCount": 210,
    "description": "Computing machinery advancement, algorithmic problem solving, and research talks.",
    "facultyAdvisor": "Dr. Seema Bawa"
  },
  {
    "id": "soc-tds",
    "name": "Thapar Dramatics Society",
    "code": "TDS",
    "category": "Cultural",
    "leadName": "Gaurav Chopra",
    "leadEmail": "gaurav.chopra@thapar.edu",
    "memberCount": 120,
    "description": "Premier stage and street play society representing the university nationally.",
    "facultyAdvisor": "Dr. Vineet Srivastava"
  },
  {
    "id": "soc-dance",
    "name": "Thapar Dance Society (Nox)",
    "code": "NOX",
    "category": "Cultural",
    "leadName": "Ananya Gupta",
    "leadEmail": "ananya.gupta@thapar.edu",
    "memberCount": 110,
    "description": "Western and classical choreography club performing at campus galas and fests.",
    "facultyAdvisor": "Dr. Richa Sharma"
  },
  {
    "id": "soc-rotaract",
    "name": "Rotaract Club of Thapar",
    "code": "ROTARACT",
    "category": "Social",
    "leadName": "Pranav Bhatia",
    "leadEmail": "pranav.bhatia@thapar.edu",
    "memberCount": 130,
    "description": "Community service, blood donation camps, and social awareness drives.",
    "facultyAdvisor": "Dr. M. D. Singh"
  }
]
$catalog$)
on conflict (id) do nothing;

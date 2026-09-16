# Satellite Stateboard Application

## Overview

The Satellite Stateboard is a mission-critical operations dashboard designed for managing satellite terminals, leases, and ship operations. Built with React 19 and styled with an Aerospace Command Center aesthetic, it provides operators with a comprehensive view of fleet status and terminal management capabilities.

## Design Philosophy

**Aerospace Command Center Aesthetic**: The interface draws inspiration from 1970s-80s mission control centers while maintaining modern usability standards. The design emphasizes:

- **High Contrast**: Deep navy backgrounds (#0f1419) with bright cyan (#00d9ff) and lime green (#00ff41) accents ensure critical information is immediately visible
- **Precision & Clarity**: Every element serves an operational purpose with no decorative clutter
- **Technical Authority**: IBM Plex Mono typography for technical data, paired with IBM Plex Sans for readability
- **Visual Feedback**: Glowing borders, animated status indicators, and smooth transitions provide immediate feedback to operator actions

## Features

### Fleet Management
- **Ship List**: Browse all 15 ships organized by class (0-10)
- **Grouping**: Group ships by class or view all ships together
- **Search**: Quick search functionality to find ships by name
- **Status Overview**: Real-time display of active terminals per ship

### Terminal Management
- **Terminal Status**: View all terminals assigned to a ship with current status (active, inactive, maintenance, standby)
- **Terminal Types**: Support for UHF, VHF, X-Band, and Ka-Band terminals
- **Status Indicators**: Color-coded status badges with pulsing indicators for active terminals
- **Terminal Details**: Expandable detail panel showing terminal configuration and notes

### Satellite Lease Tracking
- **Active Leases**: View current satellite lease assignments per terminal
- **Data Rates**: Display transmit (TX) and receive (RX) data rates in Mbps
- **Lease Phases**: Track lease phases with date ranges and phase-specific data rate changes
- **Lease Dates**: Monitor lease start and end dates at a glance
- **Lease Notes**: Operational notes for each lease with context-specific information

### Operational Management
- **Operational Notes**: Track maintenance, issues, observations, and triage notes
- **Note Severity**: Classify notes by severity level (low, medium, high, critical)
- **Note Types**: Support for maintenance, issue, observation, and triage note types
- **Timestamps**: Track when notes were created and resolved

### Problem Triage Workflow
- **Guided Diagnosis**: Step-by-step problem diagnosis workflow
- **Problem Categories**: Support for signal loss, data rate degradation, equipment failure, interference, and other issues
- **Guided Questions**: Context-specific questions for each problem type
- **Information Collection**: Structured data collection for problem diagnosis
- **Escalation**: Ability to escalate issues to support team when needed

## Data Structure

### Ships
- 15 ships with classes 0-10
- Hull numbers and descriptions
- Distributed across various operational roles

### Terminals
- 32 terminals across all ships
- Multiple terminal types (UHF, VHF, X-Band, Ka-Band)
- Status tracking (active, inactive, maintenance, standby)
- Current lease assignments

### Satellite Leases
- 26 active leases
- Transmission and reception data rates
- Multi-phase lease structures with phase-specific changes
- Lease documentation links
- Operational notes and requirements

### Operational Notes
- 5 sample notes demonstrating various note types
- Severity classifications
- Creator and resolution tracking

## User Interface Layout

### Two-Column Dashboard
- **Left Sidebar (280px)**: Fleet status and ship list with search and grouping controls
- **Main Content Area**: Terminal list and detailed information panel

### Navigation
- Click any ship in the sidebar to view its terminals
- Click any terminal to view detailed information and lease data
- Back button to return to ship selection
- Tabbed interface for notes and triage workflow

## Technical Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom Aerospace Command Center theme
- **UI Components**: shadcn/ui (Button, Badge, Input, Select, Tabs)
- **Icons**: Lucide React
- **Routing**: Wouter (client-side)
- **State Management**: React hooks (useState, useMemo)

## Color Scheme

| Element | Color | Purpose |
|---------|-------|---------|
| Background | #0f1419 | Deep navy base |
| Primary Accent | #00d9ff | Bright cyan for primary UI |
| Secondary Accent | #00ff41 | Lime green for status/success |
| Borders | #2d3748 | Dark gray for structure |
| Text | #e0e6ff | Light blue-white for readability |
| Destructive | #ff0055 | Hot pink for warnings/errors |

## Typography

- **Headers**: IBM Plex Sans Bold (700 weight)
- **Body**: IBM Plex Sans Regular (400 weight)
- **Monospace**: IBM Plex Mono for technical data and labels
- **Hierarchy**: 
  - H1: 32px
  - H2: 24px
  - Body: 16px
  - Labels: 12px

## Animation & Interaction

- **Glow Effects**: 2-second infinite glow animation on active elements
- **Pulsing Indicators**: Status indicators pulse at 2-second intervals
- **Hover States**: Data rows highlight with cyan left border on hover
- **Smooth Transitions**: 0.2-0.4 second transitions for state changes
- **Scanline Effect**: Optional CRT-style scanline overlay (CSS-based)

## Responsive Design

- **Desktop-First**: Optimized for 1200px+ screens
- **Sidebar**: Fixed 280px width
- **Main Content**: Flexible width with scrollable terminal list and detail panel
- **Mobile**: Responsive layout adapts to smaller screens

## Future Enhancement Opportunities

1. **Backend Integration**: Connect to real database for dynamic data
2. **User Authentication**: Implement operator login and role-based access
3. **Real-Time Updates**: WebSocket integration for live status updates
4. **Document Management**: Upload and link lease documents
5. **Advanced Filtering**: Filter by status, terminal type, satellite, date range
6. **Reporting**: Generate operational reports and analytics
7. **Notifications**: Alert system for critical events
8. **Wiki Integration**: Link to terminal documentation and SOPs
9. **Advanced Triage**: Machine learning-assisted problem diagnosis
10. **Multi-User Collaboration**: Real-time collaboration features

## Getting Started

### Development
```bash
cd /home/ubuntu/satellite_stateboard
pnpm install
pnpm dev
```

### Build
```bash
pnpm build
```

### Type Checking
```bash
pnpm tsc --noEmit
```

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── MainContent.tsx          # Main dashboard content area
│   │   ├── OperationalNotes.tsx     # Notes display component
│   │   ├── Sidebar.tsx              # Ship list sidebar
│   │   ├── ShipCard.tsx             # Ship card component
│   │   ├── TerminalDetail.tsx       # Terminal detail panel
│   │   ├── TerminalRow.tsx          # Terminal list row
│   │   └── TriageWorkflow.tsx       # Problem triage interface
│   ├── lib/
│   │   └── data.ts                  # Hardcoded ship, terminal, lease data
│   ├── pages/
│   │   └── Home.tsx                 # Main dashboard page
│   ├── App.tsx                      # Application root
│   ├── index.css                    # Global styles and theme
│   └── main.tsx                     # React entry point
├── index.html                       # HTML template
└── public/                          # Static assets (favicon, robots.txt)

shared/
└── types.ts                         # Shared TypeScript types
```

## Notes for Requirements Discussion

This implementation demonstrates several key concepts for the upcoming requirements discussion:

1. **Information Organization**: Ships are organized by class with search and grouping capabilities
2. **Terminal Management**: Multiple terminal types with status tracking and lease assignments
3. **Lease Tracking**: Complex lease structures with phases and data rate changes
4. **Operational Context**: Notes and triage workflow for operator support
5. **Scalability**: Architecture supports expansion to multiple user communities with different views
6. **Extensibility**: Foundation for adding wiki documentation, SOPs, and troubleshooting guides

The current implementation provides a solid foundation for gathering detailed requirements from the operator community and expanding functionality based on their specific needs.

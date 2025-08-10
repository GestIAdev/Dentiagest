# 🏴‍☠️ CUSTOM CALENDAR ARCHITECTURE v1.0
**By Punk Claude & Platform Gestia Developer**

## 🎯 CORE PHILOSOPHY
- **NO THIRD-PARTY DEPENDENCIES** for core calendar logic
- **DENTAL PRACTICE OPTIMIZED** workflow
- **ZERO WASTED SPACE** - Maximum information density
- **DRAG & DROP NATIVE** - Smooth UX without external libs

## 📁 DIRECTORY STRUCTURE
```
src/components/CustomCalendar/
├── index.ts                     # Main export
├── CalendarContainer.tsx        # Main container + state management
├── CalendarGrid.tsx            # Week view with 2x2 hour grids
├── TimeSlot.tsx               # Individual 15min slot (drop zone)
├── AppointmentCard.tsx        # Draggable appointment component
├── CalendarHeader.tsx         # Navigation + date picker + controls
├── CalendarSidebar.tsx        # Patient search + quick actions
├── hooks/
│   ├── useCalendarState.ts    # Global calendar state
│   ├── useTimeGrid.ts         # Time slot calculations
│   ├── useDragDrop.ts         # Native drag & drop logic
│   ├── useAppointmentCRUD.ts  # CRUD operations
│   └── useCalendarValidation.ts # Business rules validation
├── types/
│   ├── calendar.types.ts      # TypeScript interfaces
│   └── appointment.types.ts   # Appointment-specific types
├── utils/
│   ├── timeCalculations.ts    # Time math utilities
│   ├── gridLayout.ts          # 2x2 grid positioning
│   └── dragHelpers.ts         # Drag & drop utilities
└── styles/
    ├── calendar.module.css    # Main calendar styles
    ├── grid.module.css        # 2x2 grid specific styles
    └── animations.module.css  # Drag & drop animations
```

## 🎨 VISUAL DESIGN PRINCIPLES

### COLOR SCHEME (Following existing design system)
- **Primary**: #3B82F6 (blue-500)
- **Secondary**: #10B981 (emerald-500) 
- **Accent**: #F59E0B (amber-500)
- **Backgrounds**: 
  - Light: #F8FAFC (slate-50)
  - Medium: #E2E8F0 (slate-200)
  - Dark: #1E293B (slate-800)

### COMPONENT HIERARCHY
```
CalendarContainer
├── CalendarHeader (navigation + controls)
├── CalendarSidebar (search + quick actions)
└── CalendarGrid
    └── DayColumn (for each day)
        └── HourBlock (for each hour)
            └── TimeSlot (4 slots per hour in 2x2)
                └── AppointmentCard (if appointment exists)
```

## ⚡ PERFORMANCE STRATEGY

### RENDERING OPTIMIZATION
- **Virtual scrolling** for large date ranges
- **Memoized components** to prevent unnecessary re-renders
- **Lazy loading** for off-screen content
- **Optimistic updates** for immediate UI feedback

### STATE MANAGEMENT
- **Local state** for UI interactions (drag, hover, selection)
- **Global state** for appointment data (via existing hooks)
- **Cache strategy** for frequently accessed date ranges

## 🔧 TECHNICAL SPECIFICATIONS

### GRID SYSTEM
- **Base unit**: 15 minutes
- **Hour layout**: 2x2 grid (4 slots per hour)
- **Day view**: 7am - 9pm (14 hours = 56 slots per day)
- **Week view**: 7 days × 56 slots = 392 total slots

### DRAG & DROP LOGIC
1. **Drag start**: Capture appointment data + original position
2. **Drag over**: Visual feedback on valid drop zones
3. **Drop validation**: Check conflicts, business rules
4. **Drop execute**: Optimistic update + API call
5. **Error handling**: Revert on API failure

### RESPONSIVE BREAKPOINTS
- **Desktop**: >= 1024px (full week view)
- **Tablet**: 768px - 1023px (5-day view)
- **Mobile**: < 768px (single day view)

## 🏥 DENTAL PRACTICE FEATURES

### APPOINTMENT TYPES
- **Consulta**: 15-30 min (green)
- **Limpieza**: 45-60 min (blue)
- **Tratamiento**: 60-120 min (orange)
- **Emergencia**: Variable (red)

### BUSINESS RULES
- **Minimum duration**: 15 minutes
- **Maximum duration**: 4 hours
- **Overlap prevention**: Hard block
- **Buffer time**: 5 min between appointments
- **Lunch break**: Configurable blocked time

### VALIDATION LOGIC
- **Time conflicts**: Real-time conflict detection
- **Doctor availability**: Check against doctor schedule
- **Patient constraints**: Max 1 appointment per day per patient
- **Resource allocation**: Equipment/room availability

## 🚀 DEVELOPMENT PHASES

### PHASE 1: CORE GRID (Day 1)
- [ ] Basic 2x2 grid layout
- [ ] Time slot components
- [ ] Basic styling
- [ ] Static appointment display

### PHASE 2: INTERACTIONS (Day 2)
- [ ] Drag & drop implementation
- [ ] Appointment CRUD operations
- [ ] Validation system
- [ ] Error handling

### PHASE 3: POLISH (Day 3)
- [ ] Animations & transitions
- [ ] Responsive design
- [ ] Performance optimization
- [ ] FullCalendar migration

## 📚 DEPENDENCIES

### REQUIRED PACKAGES
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "date-fns": "^2.30.0"
}
```

### EXISTING UTILITIES TO REUSE
- `src/utils/timezone.ts` - Timezone handling (KEEP)
- `src/hooks/useAppointments.ts` - Appointment CRUD (ADAPT)
- `src/components/ui/` - Button, Modal, etc. (USE)

## 🎭 NAMING CONVENTIONS

### COMPONENTS
- **PascalCase**: `CalendarGrid`, `TimeSlot`
- **Prefix**: `Calendar` for all calendar components

### HOOKS
- **camelCase**: `useCalendarState`, `useDragDrop`
- **Prefix**: `use` + descriptive name

### STYLES
- **kebab-case**: `calendar-grid`, `time-slot`
- **BEM methodology**: `calendar__grid--active`

## 🔍 TESTING STRATEGY

### UNIT TESTS
- Time calculations
- Validation logic
- Utility functions

### INTEGRATION TESTS
- Drag & drop workflows
- CRUD operations
- Timezone handling

### E2E TESTS
- Complete appointment booking flow
- Multi-day appointment management
- Error scenarios

---

**Status**: 📋 Planning Phase
**Next**: Begin Phase 1 - Core Grid Implementation
**ETA**: 3 days total development time

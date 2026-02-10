# Mentor-Idea Collaboration - Flow Diagrams

## 1. Idea Submission & Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT SUBMITS IDEA                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  POST /api/ideas │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  Save Idea to DB     │
                    │  - title             │
                    │  - description       │
                    │  - submittedBy       │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────┐
                    │  Query All Teachers          │
                    │  (role: 'teacher')           │
                    └──────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────┐
                    │  Create Notification for     │
                    │  Each Teacher                │
                    │  - type: 'idea_submitted'    │
                    │  - recipient: teacher._id    │
                    │  - sender: student._id       │
                    └──────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────┐
                    │  Emit Socket Event to        │
                    │  Each Teacher                │
                    │  (Real-time notification)    │
                    └──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  TEACHERS RECEIVE NOTIFICATION IN NOTIFICATION PANEL            │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Show Interest Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              MENTOR CLICKS "SHOW INTEREST"                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ POST /api/ideas/:id/show-interest│
                └──────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Check if Already Interested      │
                │ (prevent duplicates)             │
                └──────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   YES                  NO
                    │                   │
                    ▼                   ▼
            ┌──────────────┐   ┌──────────────────────┐
            │ Return Error │   │ Add to interestedMen-│
            │ "Already     │   │ tors Array:          │
            │ interested"  │   │ - mentorId           │
            └──────────────┘   │ - mentorName         │
                                │ - timestamp          │
                                └──────────────────────┘
                                        │
                                        ▼
                                ┌──────────────────────┐
                                │ Create Notification  │
                                │ - type: 'mentor_inte-│
                                │   rested'            │
                                │ - recipient: student │
                                │ - sender: mentor     │
                                └──────────────────────┘
                                        │
                                        ▼
                                ┌──────────────────────┐
                                │ Emit Socket Event    │
                                │ to Student           │
                                └──────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STUDENT SEES MENTOR IN "INTERESTED MENTORS" LIST               │
│  STUDENT RECEIVES NOTIFICATION                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Send Message & Add Meet Link Flow

```
┌─────────────────────────────────────────────────────────────────┐
│         MENTOR SENDS MESSAGE IN DISCUSSION                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ POST /api/ideas/:id/discussions  │
                │ Body: { content: "message" }     │
                └──────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Find or Create Discussion        │
                │ (one per mentor-idea pair)       │
                └──────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Add Message to Discussion:       │
                │ - sender: mentor._id             │
                │ - senderName: mentor.fullName    │
                │ - content: message               │
                │ - timestamp: now()               │
                └──────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Create Notification              │
                │ - type: 'mentor_message'         │
                │ - recipient: student             │
                │ - sender: mentor                 │
                └──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STUDENT SEES MESSAGE IN DISCUSSIONS SECTION                    │
│  STUDENT RECEIVES NOTIFICATION                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         MENTOR ADDS GOOGLE MEET LINK                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────┐
        │ PUT /api/ideas/:id/discussions/:discussionId│
        │ /meet-link                                   │
        │ Body: { meetLink: "https://meet.google..." }│
        └──────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Update Discussion with meetLink  │
                └──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STUDENT SEES MEET LINK IN DISCUSSION                           │
│  STUDENT CAN CLICK TO JOIN MEET                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Accept Idea Flow

```
┌─────────────────────────────────────────────────────────────────┐
│           MENTOR CLICKS "ACCEPT IDEA"                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ POST /api/ideas/:id/accept       │
                └──────────────────────────────────┘
                              │
                              ▼
                ┌──────────────────────────────────┐
                │ Check if Already Accepted        │
                │ (only one mentor can accept)     │
                └──────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   YES                  NO
                    │                   │
                    ▼                   ▼
            ┌──────────────┐   ┌──────────────────────┐
            │ Return Error │   │ Set acceptedBy:      │
            │ "Already     │   │ - mentorId           │
            │ accepted"    │   │ - mentorName         │
            └──────────────┘   │ - timestamp          │
                                └──────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │ Create Notification for       │
                        │ Student                       │
                        │ - type: 'idea_accepted'       │
                        │ - recipient: student          │
                        │ - sender: mentor              │
                        └───────────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │ Create Notifications for      │
                        │ Other Interested Mentors      │
                        │ - type: 'idea_accepted_by_    │
                        │   other'                      │
                        │ - recipient: other_mentors    │
                        │ - sender: accepting_mentor    │
                        └───────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  STUDENT SEES "ACCEPTED" STATUS WITH MENTOR NAME                │
│  STUDENT RECEIVES ACCEPTANCE NOTIFICATION                       │
│  OTHER MENTORS RECEIVE "ACCEPTED BY OTHER" NOTIFICATION         │
│  IDEA MOVES TO MENTOR'S "ACCEPTED IDEAS" TAB                    │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Complete Collaboration Lifecycle

```
┌──────────────────────────────────────────────────────────────────┐
│                    STUDENT SUBMITS IDEA                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ All Teachers Notified │
                    └──────────────────────┘
                              │
                ┌─────────────┬─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Teacher 1    │ │ Teacher 2    │ │ Teacher 3    │
        │ Shows        │ │ Shows        │ │ Not          │
        │ Interest     │ │ Interest     │ │ Interested   │
        └──────────────┘ └──────────────┘ └──────────────┘
                │             │
                ▼             ▼
        ┌──────────────┐ ┌──────────────┐
        │ Sends        │ │ Sends        │
        │ Message      │ │ Message      │
        └──────────────┘ └──────────────┘
                │             │
                ▼             ▼
        ┌──────────────┐ ┌──────────────┐
        │ Adds Meet    │ │ Adds Meet    │
        │ Link         │ │ Link         │
        └──────────────┘ └──────────────┘
                │             │
                ▼             ▼
        ┌──────────────┐ ┌──────────────┐
        │ Accepts Idea │ │ Tries to     │
        │              │ │ Accept       │
        └──────────────┘ └──────────────┘
                │             │
                ▼             ▼
        ┌──────────────┐ ┌──────────────┐
        │ Idea Status: │ │ Gets Error:  │
        │ ACCEPTED     │ │ Already      │
        │ by Teacher 1 │ │ Accepted     │
        └──────────────┘ └──────────────┘
                │             │
                ▼             ▼
        ┌──────────────┐ ┌──────────────┐
        │ Appears in   │ │ Receives     │
        │ "Accepted    │ │ Notification │
        │ Ideas" tab   │ │ of Rejection  │
        └──────────────┘ └──────────────┘
                │
                ▼
        ┌──────────────────────────┐
        │ Student Sees:            │
        │ - Accepted Status        │
        │ - Mentor Name            │
        │ - Discussion History     │
        │ - Meet Link              │
        └──────────────────────────┘
```

## 6. Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         IDEA                                    │
├─────────────────────────────────────────────────────────────────┤
│ _id                                                             │
│ title                                                           │
│ description                                                     │
│ submittedBy ──────────────┐                                    │
│ interestedMentors ────┐   │                                    │
│ acceptedBy ────────┐  │   │                                    │
│ discussions ────┐  │  │   │                                    │
└─────────────────────────────────────────────────────────────────┘
                  │  │  │   │
        ┌─────────┘  │  │   │
        │            │  │   │
        ▼            ▼  ▼   ▼
    ┌────────────────────────────────────────────────────────────┐
    │                      USER (Teacher)                        │
    ├────────────────────────────────────────────────────────────┤
    │ _id                                                        │
    │ fullName                                                   │
    │ email                                                      │
    │ role: 'teacher'                                            │
    └────────────────────────────────────────────────────────────┘
        ▲
        │
        └─────────────────────────────────────────────────────────┐
                                                                  │
                                                                  ▼
                                                    ┌──────────────────────────┐
                                                    │   NOTIFICATION           │
                                                    ├──────────────────────────┤
                                                    │ _id                      │
                                                    │ recipient ──────────────→│
                                                    │ sender ──────────────────│
                                                    │ type: 'mentor_interested'│
                                                    │ relatedIdea ────────────→│
                                                    │ isRead                   │
                                                    └──────────────────────────┘
```

## 7. State Transitions

```
IDEA STATE MACHINE:

                    ┌─────────────────────────────────────┐
                    │  IDEA SUBMITTED (pending)           │
                    └─────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Mentor 1     │ │ Mentor 2     │ │ Mentor 3     │
        │ Shows        │ │ Shows        │ │ Shows        │
        │ Interest     │ │ Interest     │ │ Interest     │
        └──────────────┘ └──────────────┘ └──────────────┘
                │             │             │
                └─────────────┬─────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ IDEA WITH INTERESTED│
                    │ MENTORS (pending)   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Mentor 1 Accepts   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────────────┐
                    │ IDEA ACCEPTED              │
                    │ (acceptedBy: Mentor 1)     │
                    │ (interestedMentors: 2, 3)  │
                    └────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Collaboration      │
                    │ In Progress        │
                    └────────────────────┘
```

## 8. API Call Sequence Diagram

```
MENTOR                          SERVER                          DATABASE
  │                               │                               │
  ├──POST /show-interest──────────>│                               │
  │                               ├──Check if interested──────────>│
  │                               │<──Not interested──────────────┤
  │                               ├──Add to interestedMentors────>│
  │                               │<──Success──────────────────────┤
  │                               ├──Create Notification─────────>│
  │                               │<──Success──────────────────────┤
  │<──200 OK──────────────────────┤                               │
  │                               │                               │
  ├──POST /discussions────────────>│                               │
  │  (send message)               ├──Find/Create Discussion──────>│
  │                               │<──Discussion──────────────────┤
  │                               ├──Add Message────────────────>│
  │                               │<──Success──────────────────────┤
  │<──200 OK──────────────────────┤                               │
  │                               │                               │
  ├──PUT /meet-link───────────────>│                               │
  │                               ├──Update Discussion──────────>│
  │                               │<──Success──────────────────────┤
  │<──200 OK──────────────────────┤                               │
  │                               │                               │
  ├──POST /accept─────────────────>│                               │
  │                               ├──Check if accepted────────────>│
  │                               │<──Not accepted─────────────────┤
  │                               ├──Set acceptedBy──────────────>│
  │                               │<──Success──────────────────────┤
  │                               ├──Create Notifications────────>│
  │                               │<──Success──────────────────────┤
  │<──200 OK──────────────────────┤                               │
  │                               │                               │
```

This comprehensive flow diagram shows how all components interact throughout the mentor-idea collaboration lifecycle.

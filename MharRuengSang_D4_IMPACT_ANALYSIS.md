# SteamJek - Impact Analysis & Traceability Graph

## Full System Traceability Graph
This full traceability map outlines the relationships spanning from Software Requirements down to core Architectural Design (C4-inspired layout), specific Code Modules, and the corresponding Validation Testing suites. It includes our latest implementations.

```mermaid
flowchart LR
    %% Requirements Level
    subgraph Requirements["Requirements"]
        direction TB
        R1((R1)):::req
        R2((R2)):::req
        R3((R3)):::req
        R4((R4)):::newReq
        R5((R5)):::newReq
        R6((R6)):::newReq
    end

    %% Design Level (C4 Containers)
    subgraph Design["Design (Containers)"]
        direction TB
        D1((D1)):::design
        D2((D2)):::design
        D3((D3)):::design
        D4((D4)):::design
    end

    %% Code / Modules Level
    subgraph Code["Code (Modules)"]
        direction TB
        C1((C1)):::code
        C2((C2)):::code
        C3((C3)):::code
        C4((C4)):::newCode
        C5((C5)):::newCode
        C6((C6)):::newCode
    end

    %% Testing Level
    subgraph Tests["Test"]
        direction TB
        T1((T1)):::test
        T2((T2)):::test
        T3((T3)):::test
        T4((T4)):::newTest
        T5((T5)):::newTest
        T6((T6)):::newTest
    end

    %% Styles to emulate the provided black/white/gray diagram
    classDef req fill:#fff,stroke:#333,stroke-width:1px,color:#000
    classDef newReq fill:#fff,stroke:#333,stroke-width:2px,color:#000
    classDef design fill:#888,stroke:#333,stroke-width:1px,color:#fff
    classDef code fill:#f4f4f4,stroke:#333,stroke-width:1px,color:#000
    classDef newCode fill:#666,stroke:#333,stroke-width:1px,color:#fff
    classDef test fill:#ddd,stroke:#333,stroke-width:1px,color:#000
    classDef newTest fill:#999,stroke:#333,stroke-width:1px,color:#fff

    %% Cross-column dashed links
    R1 -.-> D1
    R1 -.-> D2
    R2 -.-> D1
    R2 -.-> D3
    R3 -.-> D1
    R3 -.-> D2
    R4 -.-> D1
    R4 -.-> D2
    R5 -.-> D1
    R5 -.-> D2
    R6 -.-> D1
    R6 -.-> D3

    D1 -.-> C1
    D2 -.-> C1
    D1 -.-> C2
    D3 -.-> C2
    D1 -.-> C3
    D2 -.-> C3
    D1 -.-> C4
    D2 -.-> C4
    D1 -.-> C5
    D2 -.-> C5
    D1 -.-> C6
    D3 -.-> C6

    C1 -.-> T1
    C2 -.-> T2
    C3 -.-> T3
    C4 -.-> T4
    C5 -.-> T5
    C6 -.-> T6

    %% Internal solid links representing dependencies within columns
    D1 --> D3
    D2 --> D3
    D3 --> D4
    D4 --> D1
    C4 --> C1
    C5 --> C1
    C6 --> C1
    C4 --> C6
```

> **Legend & Mapping:**
> - **Requirements:** R1 (Auth), R2 (Store), R3 (Cart), R4 (Community Hub), R5 (Point Shop), R6 (Item Marketplace)
> - **Design Containers:** D1 (Web Frontend), D2 (Mobile App), D3 (Express API), D4 (PostgreSQL)
> - **Code Modules:** C1 (authController), C2 (gamesController), C3 (cartController), C4 (communityController), C5 (pointShopController), C6 (marketController)
> - **Tests:** T1 (auth.test.js), T2 (games.test.js), T3 (cart.test.js), T4 (community.test.js), T5 (pointShop.test.js), T6 (market.test.js)

## Traceability Graph: Affected By Changes (D4)
The following isolated traceability graph matches the left-to-right visual style, but highlights **only the parts affected by the changes** in D4 (Point Shop, Community Features, and Marketplace).

```mermaid
flowchart LR
    %% Requirements Level
    subgraph Requirements["Requirements"]
        direction TB
        R4((R4)):::newReq
        R5((R5)):::newReq
        R6((R6)):::newReq
    end

    %% Design Level (C4 Containers)
    subgraph Design["Design (Containers)"]
        direction TB
        D1((D1)):::design
        D2((D2)):::design
        D3((D3)):::design
        D4((D4)):::design
    end

    %% Code / Modules Level
    subgraph Code["Code (Modules)"]
        direction TB
        C4((C4)):::newCode
        C5((C5)):::newCode
        C6((C6)):::newCode
        CDB((DB)):::newCode
    end

    %% Testing Level
    subgraph Tests["Test"]
        direction TB
        T4((T4)):::newTest
        T5((T5)):::newTest
        T6((T6)):::newTest
    end

    %% Styles to match image
    classDef newReq fill:#fff,stroke:#333,stroke-width:2px,color:#000
    classDef design fill:#888,stroke:#333,stroke-width:1px,color:#fff
    classDef newCode fill:#666,stroke:#333,stroke-width:1px,color:#fff
    classDef newTest fill:#999,stroke:#333,stroke-width:1px,color:#fff

    %% Cross-column dashed links
    R4 -.-> D1
    R4 -.-> D2
    R5 -.-> D1
    R5 -.-> D2
    R6 -.-> D1
    R6 -.-> D2

    D1 -.-> C4
    D2 -.-> C4
    D1 -.-> C5
    D2 -.-> C5
    D1 -.-> C6
    D2 -.-> C6
    D3 -.-> CDB

    C4 -.-> T4
    C5 -.-> T5
    C6 -.-> T6

    %% Internal solid links
    D1 --> D3
    D2 --> D3
    D3 --> D4
```

## SLO Directed Graph (Code Modules)
Each core code module from the architecture represents a Software Lifecycle Object (SLO).
* **SLO1**: authController.js
* **SLO2**: gamesController.js
* **SLO3**: cartController.js
* **SLO4**: communityController.js (CR)
* **SLO5**: pointShopController.js (CR)
* **SLO6**: marketController.js (CR)

Here is the directed graph visualizing the dependencies between these SLOs:

```mermaid
flowchart TD
    %% Node Definitions
    SLO1((SLO1))
    SLO2((SLO2))
    SLO3((SLO3))
    SLO4((SLO4))
    SLO5((SLO5))
    SLO6((SLO6))

    %% Edges (Dependencies)
    SLO1 --> SLO2
    SLO2 --> SLO1
    SLO2 --> SLO3
    SLO3 --> SLO1
    
    SLO4 --> SLO1
    SLO4 --> SLO2
    
    SLO5 --> SLO1
    SLO5 --> SLO6
    
    SLO6 --> SLO1
    SLO6 --> SLO3

    %% Styling to mimic the circular monochrome aesthetic
    classDef default fill:#fff,stroke:#000,stroke-width:2px,color:#000;
```

## Connectivity Matrix with Distances
The distance representing the shortest directed path between two SLOs based on the graph above. 
If no path exists (the target is unreachable from the source), it is marked as `∞`.

| Source \ Target | SLO1 | SLO2 | SLO3 | SLO4 | SLO5 | SLO6 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SLO1** | 0 | 1 | 2 | ∞ | ∞ | ∞ |
| **SLO2** | 1 | 0 | 1 | ∞ | ∞ | ∞ |
| **SLO3** | 1 | 2 | 0 | ∞ | ∞ | ∞ |
| **SLO4** | 1 | 1 | 2 | 0 | ∞ | ∞ |
| **SLO5** | 1 | 2 | 2 | ∞ | 0 | 1 |
| **SLO6** | 1 | 2 | 1 | ∞ | ∞ | 0 |


## Change Request Impact Evaluation

### 1. Which change requests are easy to apply and why?
**Point Shop:** This feature is relatively straightforward to apply. It functions as an isolated, standalone module extending the user profile. The business logic primarily involves a simple increment/decrement of a point balance after a user makes a purchase, and basic CRUD operations for unlocking standard cosmetics like frames and banners. It does not heavily interfere with existing core critical paths (like core authentication or external payment gateways), which minimizes the risk of breaking existing functionality (low regression risk).

### 2. Which change requests are difficult to apply and why?
**Item Marketplace Integration:** This is significantly difficult to implement because it introduces a complex dual-sided transactional system. It requires atomic database operations (ensuring ACID compliance) to guarantee users aren't duplicating items or manipulating virtual economies during race conditions. It also heavily couples with user inventories, point systems, and requires rigorous security validation against exploits.
**Community Forums:** This is moderately to highly difficult due to the sheer volume of relational data and state it introduces. It requires managing deeply nested data structures (Games -> Threads -> Replies -> Likes), tag-based search indexing, and ensuring database query performance remains optimal as user-generated content rapidly scales.

### 3. To make maintenance easier, what would you expect from the previous developers?
*   **Comprehensive Test Coverage:** A robust suite of unit and integration tests (especially around the core `cartController` and `purchasesController`) would provide a safety net to ensure that adding point-reward hooks doesn't accidentally break the main checkout flow.
*   **Loose Coupling / Event-Driven Architecture:** Instead of tightly binding controllers, an event-emitter pattern (e.g., dispatching a `GAME_PURCHASED` event) would allow new modules like the Point Shop to independently listen and react without modifying the core purchase code directly.
*   **Clear Documentation & Schema Diagrams:** Detailed, up-to-date Entity-Relationship (ER) diagrams and API contracts (like OpenAPI/Swagger) would significantly speed up the data-modeling phase for the new nested schemas required for the Community and Marketplace features.
*   **Modular UI Components:** The usage of clean, reusable frontend components instead of duplicated HTML/CSS blocks (which historically caused high SonarQube code smells) would make injecting new interfaces like forum boards and marketplace listings much faster and less error-prone.

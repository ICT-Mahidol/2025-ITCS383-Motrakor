# **SteamJek — C4 Model Description**

---

## **Level 1 — System Context Level**
System Architecture:
- **Roles**: User, Game Creator, Admin
- **External Systems**: <br>
&nbsp;&nbsp; --Cloud Database [Neon]<br>
&nbsp;&nbsp; --Payment Gateway [Stripe]<br>
&nbsp;&nbsp; --Cloud Object Storage [Amazon S3]<br>

Focusing a role-based access control (RBAC) in the system.

External systems are chosen to delegate concerns outside the system boundary. **Stripe** handles credit card payments. **AWS S3** stores game EXEs and assets, keeping large binary files out of the database. **Neon Database** stores all structured platform data as a managed serverless PostgreSQL database, avoiding the need for self-hosted infrastructure.

### **Context Diagram**
<img width="2112" height="1343" alt="Context Diagram (Current)" src="https://github.com/user-attachments/assets/559986c6-d9fd-47f7-b0a0-f29899864524" />
---

## **Level 2 — Container Level**
The Container diagram breaks SteamJek into separately deployable units, reflecting the decision to adopt a **microservices architecture**. Each service owns a single domain, and all client traffic passes through the **API Gateway** — which centralises SSL termination, JWT validation, rate limiting, and load balancing so that individual services do not need to implement these concerns themselves.

The six backend services — Authentication, Store, User, Order & Cart, Marketplace, and Search — each map to a distinct functional domain from the requirements. Payment logic is deliberately confined to the **Order & Cart Service**, which is the only service that calls Stripe directly. The Marketplace Service forwards payment requests to Order & Cart rather than calling Stripe itself, keeping payment orchestration in one place. All six services share **Neon Database**.

### **Container Diagram**
<img width="4304" height="2408" alt="SteamJek App Diagram (Current)" src="https://github.com/user-attachments/assets/48f62136-230d-4e31-b03d-bd8b0e571c85" />
---

## **Level 3 — Component Level**
The Component diagram applies the **single responsibility principle (SRP)** within each container. Design decisions include:

- **API Gateway** components form a sequential security pipeline — SSL Terminator → Rate Limiter → Auth Middleware → Request Router → Load Balancer — so unauthenticated or abusive requests are rejected before reaching any backend service.
- **Authentication Service** isolates the Password Manager (bcrypt) and Token Manager (JWT) from the Login/Register Controller, keeping cryptographic concerns separate from orchestration logic. The RBAC Controller is separate because role enforcement is distinct from credential validation.
- **Order & Cart Service** uses a dedicated Library Updater that calls the User Service directly after payment, replacing the previously considered Message Queue with a simpler synchronous approach suitable for the project scale.
- **Marketplace Service** uses a dedicated Ownership Controller to ensure item ownership is always verified and transferred through a single consistent path, regardless of how a trade is initiated.
- **Search Service** is a standalone service called directly by the API Gateway rather than through Store or Marketplace.
### **Component Diagram**
### SteamJek App Client
<img width="3408" height="1542" alt="SteamJek App Component Diagram (Current)" src="https://github.com/user-attachments/assets/b8beaff4-90db-44af-9499-5001813eb7f1" />

---
### API Gateway service
<img width="3552" height="1761" alt="API Gateway Component Diagram (Current)" src="https://github.com/user-attachments/assets/2cff06cf-f098-4b17-bfd3-36c9ff71a43d" />

---
### Order & Cart service
<img width="2704" height="2368" alt="Order   Cart service Component Diagram (Current)" src="https://github.com/user-attachments/assets/ce85ac8c-f8cf-49a5-b461-ec73c3bf0fa7" />

---
### Store service
<img width="1605" height="1056" alt="Store service Component Diagram (Current)" src="https://github.com/user-attachments/assets/c0fa307e-8c02-466c-9b54-784fd62b5d7b" />

---
### User service
<img width="2416" height="1257" alt="User service Component Diagram (Current)" src="https://github.com/user-attachments/assets/4295a401-be81-4118-8fd6-6c637d76cf28" />

---
### Marketplace service
<img width="2688" height="2184" alt="Marketplace service Component Diagram (Current)" src="https://github.com/user-attachments/assets/f932a1c5-b991-40ed-90d6-0ee06191ef55" />

---
### Search service
<img width="1840" height="1391" alt="Search service Component Diagram (Current)" src="https://github.com/user-attachments/assets/77fa6ddd-fdbd-4cba-8652-6ed4d11ff707" />

---
### Authentication service
<img width="2672" height="1618" alt="Authentication service Component Diagram (Current)" src="https://github.com/user-attachments/assets/ff98ad6d-4fc1-4252-9706-45f71242a9f5" />

---

# SteamJek — Usecase Diagram Description

---

## Overview

The Use Case diagram maps all functional interactions across four sections — Authentication, User Actions, Admin Actions, and Game Creator. A **Person** parent actor captures use cases shared by all roles via UML generalisation, with RBAC enforcing what each concrete actor can access.

---

## Authentication (Person)

**Person** holds only **Log in**, inherited by all three actors via generalisation. **Register account** is excluded from Person because only User and Game Creator self-register — Admin accounts are provisioned separately, so there is no public signup for that role.

---

## User Actions

User owns thirteen use cases covering the full game consumption and trading lifecycle. Key relationship decisions: **Search game** extends to **Use filter search** (`<<extends>>`) because filtering is optional. **Make payment** includes **Store order history** (`<<include>>`) because recording an order is mandatory on every payment. **Make payment** also connects to the **Payment Gateway** external actor. **Manage inventory** extends to both **Buy in-game item** and **Sell in-game item**, and **Play game** extends to **Review game** — both optional flows. 

---

## Admin Actions

Admin has three use cases and no Register account, as admin access is not self-created. **Approve game upload** includes **Upload game files** (`<<include>>`), modelling the dependency that an approval always references an existing upload made by a Game Creator.

---

## Game Creator

Game Creator has three use cases. **Register account** appears here separately from Person because creators self-register with a role-specific flow. **Upload game files** connects to the **Cloud Object Storage** external actor since EXEs are stored directly in AWS S3. **Configure game information** is a separate use case from upload, covering metadata such as pricing, age rating, and system requirements.

### **Usecase Diagram**
<img width="1145" height="1451" alt="SteamJek_UseCaseDiagram" src="https://github.com/user-attachments/assets/4b42b35e-e3d9-4472-9bc9-d08ff6fa6143" />

---

import {TestUserRepository} from "@repo/TestUserRepository"
import {TestSeniorRepository} from "@repo/TestSeniorRepository"
import {UserService} from "@serv/UserService"
import {SeniorManagementService} from "@serv/SeniorManagementService"
import {AuthService} from "@serv/AuthService"
import {JWTSessionService} from "@serv/JWTSessionService"
import {Router} from "@http/Router"
import {EndpointRegistry} from "@http/EndpointRegistry"
import {serveBun} from "@http/BunAdapter"
import {TestFSDatabase} from "./lib/TestFSDatabase"

import {updateUser} from "@endpoint/users/updateUser"
import {addSenior} from "@endpoint/seniors/addSenior"
import {getAllSeniors} from "@endpoint/seniors/getAllSeniors"
import {login} from "@endpoint/auth/login"
import {register} from "@endpoint/auth/register"
import {logout} from "@endpoint/auth/logout"
import {refreshToken} from "@endpoint/auth/refreshToken"
import {getCurrentSession} from "@endpoint/auth/getCurrentSession"
import {me} from "@endpoint/users/me"
import {getAvailableCaretakers} from "@endpoint/caretakers/getAvailableCaretakers"
import {getCaretakerById} from "@endpoint/caretakers/getCaretakerById"
import {updateCaretakerProfile} from "@endpoint/caretakers/updateCaretakerProfile"

import {TestStatusLogRepository} from "@repo/TestStatusLogRepository"
import {StatusLogService} from "@serv/StatusLogService"
import {getStatusLogs} from "@endpoint/statusLogs/getStatusLogs"
import {createStatusLog} from "@endpoint/statusLogs/createStatusLog"

// ── Infrastructure ────────────────────────────────────────────────────────────
const db = new TestFSDatabase()
const userRepo = new TestUserRepository(db)
const seniorRepo = new TestSeniorRepository(db)
const statusLogRepo = new TestStatusLogRepository(db) // ← new repository for status logs
const statusLogService = new StatusLogService(statusLogRepo)  // ← removed bookingRepo dependency from StatusLogService constructor

// ── Services ──────────────────────────────────────────────────────────────────
const jwtSessionService = new JWTSessionService(userRepo, process.env["JWT_SECRET"] ?? "change-me-in-production")
const userService = new UserService(userRepo)
const seniorManagementService = new SeniorManagementService(userRepo, seniorRepo)
const authService = new AuthService(userService, jwtSessionService)

// ── HTTP ──────────────────────────────────────────────────────────────────────
const router = new Router(jwtSessionService)
const registry = new EndpointRegistry(router)

registry
// Auth
.register(login, [authService])
  .register(register, [authService])
  .register(logout, [authService])
  .register(refreshToken, [jwtSessionService])
  .register(getCurrentSession, [])
  // Users
  .register(updateUser, [userService])
  .register(me, [userService])
  // Caretakers
  .register(getAvailableCaretakers, [userService])
  .register(getCaretakerById, [userService])
  .register(updateCaretakerProfile, [userService])
  // Seniors
  .register(addSenior, [seniorManagementService])
  .register(getAllSeniors, [seniorManagementService])
  // Status Logs — wired after BE-BOOKING-TASK is merged

serveBun(router, {port: 3000})
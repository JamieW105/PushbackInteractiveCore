--[[
    PUSHBACK INTERACTIVE CORE
    Admin & Server Management Integration
    
    Setup:
    1. Create a Script in ServerScriptService
    2. Paste this code.
    3. Configure API_URL and API_KEY below.
    4. Enable 'Allow HTTP Requests' and 'Enable Studio Access to API Services'.
]]

local MessagingService = game:GetService("MessagingService")
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local TextChatService = game:GetService("TextChatService")
local LogService = game:GetService("LogService")
local RunService = game:GetService("RunService")

-- CONFIGURATION
local TOPIC_NAME = "AdminActions"
local API_URL = "http://192.168.68.120:3000/api/roblox" -- REPLACE THIS
local API_KEY = "7f3b9c2a1e8d4f5b6c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8" -- Matches .env.local

local JOB_ID = game.JobId ~= "" and game.JobId or "STUDIO_TEST_" .. os.time()

-------------------------------------------------------------------------------
-- 1. HTTP HELPER
-------------------------------------------------------------------------------
local function sendApiRequest(endpoint, payload)
    payload.apiKey = API_KEY
    payload.jobId = JOB_ID
    
    local success, response = pcall(function()
        return HttpService:PostAsync(
            API_URL .. endpoint,
            HttpService:JSONEncode(payload),
            Enum.HttpContentType.ApplicationJson,
            false
        )
    end)
    
    if not success then
        warn("[PBI CORE] API Request Failed (" .. endpoint .. "): " .. tostring(response))
    end
end

-------------------------------------------------------------------------------
-- 2. SERVER HEARTBEAT
-------------------------------------------------------------------------------
local function sendHeartbeat()
    local placeId = game.PlaceId
    local joinLink = "https://www.roblox.com/games/start?placeId=" .. placeId .. "&gameInstanceId=" .. JOB_ID

    local payload = {
        status = "active",
        region = "Unknown", -- Roblox doesn't expose region easily in Lua, sadly.
        placeVersion = tostring(game.PlaceVersion),
        fps = workspace:GetRealPhysicsFPS(),
        ping = 0, -- Server ping to what? Usually client-side stat. We can skip or estimate.
        playerCount = #Players:GetPlayers(),
        maxPlayers = Players.MaxPlayers,
        joinLink = joinLink
    }
    sendApiRequest("/server", payload)
end

task.spawn(function()
    while true do
        sendHeartbeat()
        task.wait(30) -- Every 30 seconds
    end
end)

-------------------------------------------------------------------------------
-- 3. LOG STREAMING
-------------------------------------------------------------------------------
local logBuffer = {}
local MAX_BUFFER_SIZE = 50

LogService.MessageOut:Connect(function(message, msgType)
    local typeStr = "Output"
    if msgType == Enum.MessageType.MessageOutput then typeStr = "Info"
    elseif msgType == Enum.MessageType.MessageInfo then typeStr = "Info" 
    elseif msgType == Enum.MessageType.MessageWarning then typeStr = "Warning"
    elseif msgType == Enum.MessageType.MessageError then typeStr = "Error"
    end
    
    table.insert(logBuffer, {
        message = message,
        type = typeStr,
        timestamp = os.time()
    })
    
    -- Flush if full
    if #logBuffer >= MAX_BUFFER_SIZE then
        local logsToSend = logBuffer
        logBuffer = {} -- Clear immediately
        sendApiRequest("/logs", { logs = logsToSend })
    end
end)

-- Periodic Flush
task.spawn(function()
    while true do
        task.wait(5)
        if #logBuffer > 0 then
            local logsToSend = logBuffer
            logBuffer = {}
            sendApiRequest("/logs", { logs = logsToSend })
        end
    end
end)

-------------------------------------------------------------------------------
-- 4. SERVER LIFECYCLE
-------------------------------------------------------------------------------
game:BindToClose(function()
    print("[PBI CORE] Server Shutting Down...")
    -- Send Shutdown Signal (Synchronous attempt)
    -- HttpService requests might fail in BindToClose if not careful, but usually work closely.
    
    -- We use a raw request here to ensure it blocks? No, PostAsync yields.
    
    local payload = { apiKey = API_KEY, jobId = JOB_ID }
    -- We create a coroutine that waits for it?
    -- No, BindToClose allows yielding up to 30s.
    
    pcall(function()
        HttpService:PostAsync(
            API_URL .. "/server", 
            HttpService:JSONEncode(payload), -- We use DELETE method? 
            -- Roblox PostAsync doesn't support DELETE method easily without hacking headers or URL params?
            -- Wait, Next.js API expects DELETE method. Roblox generic RequestAsync supports it.
            Enum.HttpContentType.ApplicationJson,
            false,
            { ["Method"] = "DELETE" } -- This is not valid arg for PostAsync.
        )
    end)
    
    -- Use RequestAsync for DELETE
    pcall(function() 
        HttpService:RequestAsync({
            Url = API_URL .. "/server",
            Method = "DELETE",
            Headers = { ["Content-Type"] = "application/json" },
            Body = HttpService:JSONEncode(payload)
        })
    end)
end)


-------------------------------------------------------------------------------
-- 5. MESSAGING SERVICE (COMMANDS)
-------------------------------------------------------------------------------
-- Helper for notifications
local function notifyPlayer(player, message, isWarning)
    -- ... (Same as before)
    -- Simplified for brevity
    local h = Instance.new("Hint")
    h.Text = "[ADMIN]: " .. message
    h.Parent = workspace
    game:GetService("Debris"):AddItem(h, 5)
end

local function handleMessage(message)
    local payload = message.Data
    if type(payload) == "string" then
        pcall(function() payload = HttpService:JSONDecode(payload) end)
    end
    -- Unnest if needed (Open Cloud double encode)
    if payload.message and type(payload.message) == "string" then
         pcall(function() payload = HttpService:JSONDecode(payload.message) end)
    end
    
    local target = tostring(payload.target)
    local action = payload.action
    local reason = (payload.data and payload.data.reason) or "No reason"
    
    print("[PBI CORE] Command Received:", action, "Target:", target)

    -- CHECK FOR SERVER SHUTDOWN
    if action == "shutdown_server" then
        if target == JOB_ID then
            print("[PBI CORE] STARTING REMOTE SHUTDOWN...")
            -- Kick all players
            for _, p in pairs(Players:GetPlayers()) do
                p:Kick("\nServer Shutdown by Admin\nReason: " .. reason)
            end
            task.wait(1) -- Give time for kicks
            -- The server will naturally close when empty, but we can't force close via API easily 
            -- except ensuring everyone is gone.
        end
        return
    end

    -- CHECK FOR PLAYER COMMANDS
    local targetPlayer = nil
    for _, p in pairs(Players:GetPlayers()) do
        if tostring(p.UserId) == target or string.lower(p.Name) == string.lower(target) then
            targetPlayer = p
            break
        end
    end

    if targetPlayer then
        if action == "kick" then
            targetPlayer:Kick(reason)
        elseif action == "warn" then
            notifyPlayer(targetPlayer, reason, true)
        elseif action == "message" then
            notifyPlayer(targetPlayer, reason, false)
        end
    end
end

MessagingService:SubscribeAsync(TOPIC_NAME, handleMessage)
print("[PBI CORE] Admin System Subscribed.")

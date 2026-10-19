@echo off
title SyncWash Laundry Management System
echo ==========================================
echo       Starting SyncWash System...
echo ==========================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm.cmd install
)

echo Opening SyncWash in your default browser...
start http://localhost:5173
call npm.cmd run dev

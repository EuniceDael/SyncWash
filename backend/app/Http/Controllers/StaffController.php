<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        return User::where('role', 'staff')
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'is_active']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'regex:/^09\d{9}$/', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $staff = User::create([
            ...$data,
            'role' => 'staff',
            'is_active' => true,
            'registered_by' => $request->user()->id,
        ]);

        return response()->json($staff, 201);
    }

    public function setActive(Request $request, User $user)
    {
        abort_unless($user->role === 'staff', 404);

        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update($data);

        if (! $data['is_active']) {
            $user->tokens()->delete();
        }

        return $user->only('id', 'name', 'phone', 'is_active');
    }
}
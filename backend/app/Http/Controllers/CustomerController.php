<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'customer')->orderBy('name');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->limit(50)->get(['id', 'name', 'phone', 'address']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'regex:/^09\d{9}$/', 'unique:users,phone'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $customer = User::create([
            ...$data,
            'password' => config('syncwash.default_password'),
            'role' => 'customer',
            'must_change_password' => true,
            'registered_by' => $request->user()->id,
        ]);

        return response()->json($customer, 201);
    }
}
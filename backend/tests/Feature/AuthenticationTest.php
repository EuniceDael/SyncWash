<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_log_in_and_fetch_their_profile(): void
    {
        User::create([
            'name' => 'Test Customer',
            'phone' => '09123456789',
            'password' => 'password123',
        ]);

        $login = $this->postJson('/api/login', [
            'phone' => '09123456789',
            'password' => 'password123',
        ])->assertOk()->assertJsonStructure([
            'token',
            'user' => ['id', 'name', 'phone', 'role'],
        ]);

        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('phone', '09123456789');
    }

    public function test_a_user_can_log_out_and_revoke_their_token(): void
    {
        User::create([
            'name' => 'Test Customer',
            'phone' => '09123456789',
            'password' => 'password123',
        ]);

        $token = $this->postJson('/api/login', [
            'phone' => '09123456789',
            'password' => 'password123',
        ])->assertOk()->json('token');

        $this->withToken($token)->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/me')->assertUnauthorized();
    }
}

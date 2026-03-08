<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Group extends Model
{
    protected $fillable = [
        'name',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function members()
    {
        return $this->hasMany(User::class);
    }

    public function group_post()
    {
        return $this->hasMany(GroupPost::class);
    }
}

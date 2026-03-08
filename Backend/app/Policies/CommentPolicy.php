<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Comment;
use Illuminate\Auth\Access\Response;

class CommentPolicy
{
    /**
     * Create a new policy instance.
     */
    public function edit(User $user, Comment $comment) : Response
    {
        return $user->id === $comment->user_id
        ? Response::allow()
        : Response::deny('Vous ne pouvez pas modifier ce commentaire');
    }


    public function delete (User $user, Comment $comment) : Response
    {
        return $user->id === $comment->user_id
        ? Response::allow()
        : Response::deny('Vous ne pouvez pas supprimer ce commentaire');
    }
}

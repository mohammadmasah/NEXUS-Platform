<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;

class LikeController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/post/{id}/like",
     *     summary="Toggle like on a post",
     *     tags={"Likes"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Like added or removed")
     * )
     */
    public function toggle(Post $post)
    {
        $userId = auth()->id();

        $likeExiste = Like::where('post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if ($likeExiste) {
            $likeExiste->delete();
            return response()->json(['message' => 'Like supprimé']);
        }

        Like::create([
            'post_id' => $post->id,
            'user_id' => $userId
        ]);

        return response()->json(['message' => 'Like ajouté']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroupController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/createGroup",
     *     summary="Create a group",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="My Group")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Group created"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function createGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $group = Group::create([
            'name' => $request->name,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Group created!',
            'group' => $group
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/getGroups",
     *     summary="Get all groups of the authenticated user",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of groups")
     * )
     */
    public function getGroups(Request $request)
    {
        $groups = Group::get()->where('user_id', $request->user()->id);
        return response()->json($groups);
    }

    /**
     * @OA\Get(
     *     path="/api/group/{group}",
     *     summary="Get a single group",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="group",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Group details"),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function getGroup(Group $group)
    {
        return response()->json($group);
    }

    /**
     * @OA\Get(
     *     path="/api/getAllUsers",
     *     summary="Get all users",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of users")
     * )
     */
    public function getAllUsers()
    {
        $users = User::all();
        return response()->json($users);
    }


    /**
     * @OA\Put(
     *     path="/api/updateGroup/{id}",
     *     summary="Update a group",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="New Group Name")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Group updated"),
     *     @OA\Response(response=404, description="Group not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateGroup(Request $request, $id)
    {
        $group = Group::findOrFail($id);
        $request->validate(['name' => 'required|max:20']);
        $group->fill($request->only(['name']));
        $group->save();
        return response()->json(['message' => 'Groupe modifié', $group]);
    }

    /**
     * @OA\Delete(
     *     path="/api/deleteGroup/{id}",
     *     summary="Delete a group",
     *     tags={"Groups"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Group deleted"),
     *     @OA\Response(response=404, description="Group not found")
     * )
     */
    public function deleteGroup($id)
    {
        $group = Group::findOrFail($id);
        $group->delete();
        return response()->json(['message' => 'groupe supprimé']);
    }
}

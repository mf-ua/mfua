<?php

namespace App\Http\Controllers\GlobalMap;

use App\Models\Photo;
use App\Traits\FilterPhotosByGeoHashTrait;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class GlobalMapController extends Controller
{
    use FilterPhotosByGeoHashTrait;

    /**
     * Get public friendly point data at zoom levels 16 or above
     *
     * @return array
     */
    public function index(): array
    {
        $query = Photo::query()
            ->select(
                'id',
                'verified',
                'user_id',
                'team_id',
                'result_string',
                'filename',
                'geohash',
                'lat',
                'lon',
                'remaining',
                'datetime',
                'public_friendly'
            )
//            ->where('public_friendly', true)
            ->with([
                'user' => function ($query) {
                    $query->where('users.show_name_maps', 1)
                        ->orWhere('users.show_username_maps', 1)
                        ->select('users.id', 'users.name', 'users.username', 'users.show_username_maps', 'users.show_name_maps');
                },
                'team' => function ($query) {
                    $query->select('teams.id', 'teams.name');
                }
            ]);

        if (request()->year) {
            $query->whereYear('datetime', request()->year);
        }

        $photos = $this->filterPhotosByGeoHash(
            $query,
            request()->bbox,
            request()->layers ?: null
        )->get();

        return $this->photosToGeojson($photos);
    }
}

module Data.Progress exposing (Progress, decode)

import Array exposing (Array)
import Data.LatLng as LatLng exposing (LatLng)
import Json.Decode as Decode


type alias Progress =
    { result : Array Polygon
    , visiting : Array Polygon
    , progress : Float
    }


type alias Polygon =
    Array (Array LatLng)


decode =
    Decode.map3
        (\result visiting value -> { result = result, visiting = visiting, progress = value })
        (Decode.field "result" (Decode.array decodePolygon))
        (Decode.field "visiting" (Decode.array decodePolygon))
        (Decode.field "progress" Decode.float)


decodePolygon : Decode.Decoder Polygon
decodePolygon =
    Decode.array (Decode.array LatLng.decode)

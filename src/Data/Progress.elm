module Data.Progress exposing (Progress, decode)

import Data.LatLng as LatLng exposing (LatLng)
import Json.Decode as Decode


type alias Progress =
    { result : List Polygon
    , visiting : List Polygon
    , progress : Float
    }


type alias Polygon =
    List (List LatLng)


decode =
    Decode.map3
        (\result visiting value ->
            { result = result
            , visiting = visiting
            , progress = value
            }
        )
        (Decode.field "result" (Decode.list decodePolygon))
        (Decode.field "visiting" (Decode.list decodePolygon))
        (Decode.field "progress" Decode.float)


decodePolygon : Decode.Decoder Polygon
decodePolygon =
    Decode.list (Decode.list LatLng.decode)

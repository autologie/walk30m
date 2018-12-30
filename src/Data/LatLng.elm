module Data.LatLng exposing (LatLng, decode, encode)

import Json.Decode as Decode
import Json.Encode as Encode


type alias LatLng =
    { lat : Float, lng : Float }


encode coord =
    Encode.object
        [ ( "lat", Encode.float coord.lat )
        , ( "lng", Encode.float coord.lng )
        ]


decode =
    Decode.map2
        (\lat lng -> { lat = lat, lng = lng })
        (Decode.field "lat" Decode.float)
        (Decode.field "lng" Decode.float)

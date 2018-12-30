module Data.MapOptions exposing (MapOptions, encode)

import Data.LatLng as LatLng exposing (LatLng)
import Data.TravelMode as TravelMode exposing (TravelMode(..))
import Json.Encode as Encode


type alias MapOptions =
    { zoom : Int, center : LatLng }


encode : MapOptions -> Encode.Value
encode options =
    Encode.object
        [ ( "zoom", Encode.int options.zoom )
        , ( "center", LatLng.encode options.center )
        ]

module Data.Request exposing (Request, encode)

import Data.LatLng as LatLng exposing (LatLng)
import Data.Preference as Preference exposing (Preference(..))
import Data.TravelMode as TravelMode exposing (TravelMode(..))
import Json.Decode as Decode
import Json.Encode as Encode


type alias Request =
    { travelMode : TravelMode
    , time : Int
    , origin : LatLng
    , preference : Preference
    , smoothGeometry : Bool
    , dissolveGeometry : Bool
    , avoidFerries : Bool
    , avoidHighways : Bool
    , avoidTolls : Bool
    }


encode : Request -> Encode.Value
encode request =
    Encode.object
        [ ( "travelMode", TravelMode.encode request.travelMode )
        , ( "time", Encode.int request.time )
        , ( "origin", LatLng.encode request.origin )
        , ( "preference", Preference.encode request.preference )
        , ( "smoothGeometry", Encode.bool request.smoothGeometry )
        , ( "dissolveGeometry", Encode.bool request.dissolveGeometry )
        , ( "avoidFerries", Encode.bool request.avoidFerries )
        , ( "avoidHighways", Encode.bool request.avoidHighways )
        , ( "avoidTolls", Encode.bool request.avoidTolls )
        ]

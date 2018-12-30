module Data.Request exposing (Preference(..), Request, TravelMode(..), encode)

import Data.LatLng as LatLng exposing (LatLng)
import Json.Decode as Decode
import Json.Encode as Encode


type TravelMode
    = Driving
    | Walking


type Preference
    = Speed
    | Balance
    | Precision


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
        [ ( "travelMode"
          , Encode.string
                (case request.travelMode of
                    Driving ->
                        "DRIVING"

                    Walking ->
                        "WALKING"
                )
          )
        , ( "time", Encode.int request.time )
        , ( "origin", LatLng.encode request.origin )
        , ( "preference"
          , Encode.string
                (case request.preference of
                    Speed ->
                        "SPEED"

                    Balance ->
                        "BALANCE"

                    Precision ->
                        "PRECISION"
                )
          )
        , ( "smoothGeometry", Encode.bool request.smoothGeometry )
        , ( "dissolveGeometry", Encode.bool request.dissolveGeometry )
        , ( "avoidFerries", Encode.bool request.avoidFerries )
        , ( "avoidHighways", Encode.bool request.avoidHighways )
        , ( "avoidTolls", Encode.bool request.avoidTolls )
        ]

module Data.Execution exposing (Execution, complete, create)

import Api
import Data.LatLng as LatLng
import Data.Preference as Preference
import Data.Request as Request exposing (Request)
import Data.TravelMode as TravelMode
import Json.Decode as Decode
import Json.Encode as Encode
import Task exposing (Task)


type alias Execution =
    { id : Maybe String
    , request : Request
    , progress : Float
    }


create : Request -> Api.Settings -> Task String Execution
create request =
    Api.post
        { body =
            createBody
                { id = Nothing
                , progress = 0
                , request = request
                }
        , path = "/executions"
        , decodeResponse = decodeResponse
        }


complete : Execution -> Api.Settings -> Task String Execution
complete execution =
    case execution.id of
        Just id ->
            Api.put
                { body = createBody execution
                , path = "/executions/" ++ id
                , decodeResponse = decodeResponse
                }

        Nothing ->
            \_ -> Task.fail "ID is not assigned."


createBody { request } =
    Encode.object
        [ ( "mode", TravelMode.encode request.travelMode )
        , ( "time", Encode.int request.time )
        , ( "originCoordinate", LatLng.encode request.origin )
        , ( "originAddress", Encode.string "" )
        , ( "preference", Preference.encode request.preference )
        , ( "avoidFerries", Encode.bool request.avoidFerries )
        , ( "avoidHighways", Encode.bool request.avoidHighways )
        , ( "avoidTolls", Encode.bool request.avoidTolls )
        ]


decodeResponse : Decode.Decoder Execution
decodeResponse =
    Decode.map8
        (\id avoidFerries avoidHighways avoidTolls mode origin preference time ->
            let
                request : Request
                request =
                    { avoidFerries = avoidFerries
                    , avoidHighways = avoidHighways
                    , avoidTolls = avoidTolls
                    , travelMode = mode
                    , origin = origin
                    , preference = preference
                    , time = time
                    , smoothGeometry = True
                    , dissolveGeometry = True
                    }
            in
            { id = Just id
            , request = request
            , progress = 0
            }
        )
        (Decode.field "id" Decode.string)
        (Decode.field "avoidFerries" Decode.bool)
        (Decode.field "avoidHighways" Decode.bool)
        (Decode.field "avoidTolls" Decode.bool)
        (Decode.field "mode" TravelMode.decode)
        (Decode.field "originCoordinate" LatLng.decode)
        (Decode.field "preference" Preference.decode)
        (Decode.field "time" Decode.int)

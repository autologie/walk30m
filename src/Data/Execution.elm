module Data.Execution exposing (Execution(..), complete, create)

import Api
import Data.LatLng as LatLng
import Data.Preference as Preference
import Data.Progress exposing (Progress)
import Data.Request as Request exposing (Request)
import Data.TravelMode as TravelMode
import Json.Decode as Decode
import Json.Encode as Encode
import Task exposing (Task)


type Execution
    = Unsaved Request
    | Ongoing String Request (List Progress)
    | Done String Request (List Progress)


create : Request -> Api.Settings -> Task String Execution
create request =
    Api.post
        { body = Just (body request Nothing Nothing)
        , path = "/executions"
        , decodeResponse = decodeResponse Ongoing
        }


complete : Execution -> Api.Settings -> Task String Execution
complete execution =
    case execution of
        Ongoing id request ({ result } :: _) ->
            Api.put
                { body = Just (body request (Just "completed") (List.head result))
                , path = "/executions/" ++ id
                , decodeResponse = decodeResponse Done
                }

        _ ->
            \_ -> Task.fail "Execution state is unexpected."


body request status resultPath =
    Encode.object
        ((status
            |> Maybe.map (\s -> [ ( "status", Encode.string s ) ])
            |> Maybe.withDefault []
         )
            ++ (resultPath
                    |> Maybe.map (\s -> [ ( "resultPath", s ) ])
                    |> Maybe.withDefault []
               )
            ++ [ ( "mode", TravelMode.encode request.travelMode )
               , ( "time", Encode.int request.time )
               , ( "originCoordinate", LatLng.encode request.origin )
               , ( "originAddress", Encode.string "" )
               , ( "preference", Preference.encode request.preference )
               , ( "avoidFerries", Encode.bool request.avoidFerries )
               , ( "avoidHighways", Encode.bool request.avoidHighways )
               , ( "avoidTolls", Encode.bool request.avoidTolls )
               ]
        )


decodeResponse : (String -> Request -> List Progress -> Execution) -> Decode.Decoder Execution
decodeResponse toExecution =
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
            toExecution id request []
        )
        (Decode.field "id" Decode.string)
        (Decode.field "avoidFerries" Decode.bool)
        (Decode.field "avoidHighways" Decode.bool)
        (Decode.field "avoidTolls" Decode.bool)
        (Decode.field "mode" TravelMode.decode)
        (Decode.field "originCoordinate" LatLng.decode)
        (Decode.field "preference" Preference.decode)
        (Decode.field "time" Decode.int)

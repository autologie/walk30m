module Data.Execution exposing (Execution, create)

import Data.LatLng as LatLng
import Data.Preference as Preference
import Data.Request as Request exposing (Request)
import Data.TravelMode as TravelMode
import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Task exposing (Task)


type alias Execution =
    { id : Maybe String, request : Request }


create : String -> Execution -> Task String Execution
create authToken execution =
    Http.task
        { method = "POST"
        , body = Http.jsonBody (createBody execution)
        , url = "http://localhost:8080/executions"
        , headers = [ Http.header "Authorization" ("Bearer " ++ authToken) ]
        , timeout = Nothing
        , resolver =
            Http.stringResolver
                (\res ->
                    case res of
                        Http.GoodStatus_ _ body ->
                            Decode.decodeString decodeCreateResponse body |> Result.mapError (\err -> "")

                        _ ->
                            Err ""
                )
        }


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


decodeCreateResponse : Decode.Decoder Execution
decodeCreateResponse =
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

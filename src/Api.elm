module Api exposing (Settings, post, put)

import Http
import Json.Decode as Decode
import Json.Encode as Encode
import Task exposing (Task)


type alias Settings =
    { authToken : String, baseUrl : String }


type alias RequestConfig a =
    { body : Encode.Value
    , path : String
    , decodeResponse : Decode.Decoder a
    }


post : RequestConfig a -> Settings -> Task String a
post config settings =
    request "POST" config settings


put : RequestConfig a -> Settings -> Task String a
put config settings =
    request "PUT" config settings


request : String -> RequestConfig a -> Settings -> Task String a
request method { body, path, decodeResponse } { authToken, baseUrl } =
    Http.task
        { method = method
        , body = Http.jsonBody body
        , url = baseUrl ++ path
        , headers =
            [ Http.header "Authorization" ("Bearer " ++ authToken)
            , Http.header "Accept" "application/json"
            ]
        , timeout = Nothing
        , resolver =
            Http.stringResolver
                (\res ->
                    case res of
                        Http.GoodStatus_ _ responseBody ->
                            Decode.decodeString decodeResponse responseBody
                                |> Result.mapError parseFailed

                        Http.BadStatus_ _ responseBody ->
                            Decode.decodeString decodeErrorResponse responseBody
                                |> Result.mapError parseFailed
                                |> Result.andThen (\message -> Err message)

                        _ ->
                            Err "Unknown Error"
                )
        }


parseFailed err =
    "Parse failed."


decodeErrorResponse : Decode.Decoder String
decodeErrorResponse =
    Decode.field "message" Decode.string

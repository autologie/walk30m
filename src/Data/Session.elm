module Data.Session exposing (Session(..), User, create)

import Http
import Json.Decode as Decode
import Json.Encode as Encode


type Session
    = Session String User


type alias User =
    { tenantId : String
    , id : String
    , displayName : String
    , role : String
    , lastSignIn : Maybe String
    }


create token toMsg =
    Http.post
        { body = Http.jsonBody (createBody token)
        , expect =
            Http.expectJson
                toMsg
                decodeResponse
        , url = "http://localhost:8080/session"
        }


createBody token =
    Encode.object
        [ ( "provider", Encode.string "google" )
        , ( "token", Encode.string token )
        ]


decodeResponse : Decode.Decoder Session
decodeResponse =
    Decode.map2
        (\token user -> Session token user)
        (Decode.field "token" Decode.string)
        (Decode.field "user" decodeUser)


decodeUser : Decode.Decoder User
decodeUser =
    Decode.map5
        (\tenantId id displayName role lastSignIn ->
            { tenantId = tenantId
            , id = id
            , displayName = displayName
            , role = role
            , lastSignIn = lastSignIn
            }
        )
        (Decode.field "tenantId" Decode.string)
        (Decode.field "id" Decode.string)
        (Decode.field "displayName" Decode.string)
        (Decode.field "role" Decode.string)
        (Decode.field "lastSignIn" (Decode.nullable Decode.string))

module Data.Transaction exposing (Currency(..), Transaction, create, fetchToken)

import Api
import Data.LatLng as LatLng
import Data.Request as Request exposing (Request)
import Json.Decode as Decode
import Json.Encode as Encode
import Task exposing (Task)


type Currency
    = JPY


type alias Transaction =
    { itemAmount : Int
    , paymentAmount : Float
    , currency : Currency
    , nonce : String
    }


fetchToken : Api.Settings -> Task String String
fetchToken =
    Api.get
        { path = "/transactions/token"
        , body = Nothing
        , decodeResponse = Decode.field "token" Decode.string
        }


create : Transaction -> Api.Settings -> Task String ()
create transaction =
    Api.post
        { path = "/transactions"
        , body = Just (encode transaction)
        , decodeResponse = Decode.succeed ()
        }


encode : Transaction -> Encode.Value
encode { itemAmount, paymentAmount, currency, nonce } =
    Encode.object
        [ ( "itemAmount", Encode.int itemAmount )
        , ( "paymentAmount", Encode.float paymentAmount )
        , ( "currency", encodeCurrency currency )
        , ( "nonce", Encode.string nonce )
        ]


encodeCurrency : Currency -> Encode.Value
encodeCurrency currency =
    case currency of
        JPY ->
            Encode.string "JPY"

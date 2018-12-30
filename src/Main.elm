port module Main exposing (main)

import Browser
import Data.LatLng as LatLng exposing (LatLng)
import Data.MapOptions as MapOptions exposing (MapOptions)
import Data.Preference as Preference exposing (Preference(..))
import Data.Progress as Progress exposing (Progress)
import Data.Request as Request exposing (Request)
import Data.Session as Session exposing (Session(..))
import Data.TravelMode as TravelMode exposing (TravelMode(..))
import Html exposing (button, div, h1, input, label, option, p, section, select, span, text)
import Html.Attributes exposing (attribute, checked, class, id, selected, style, type_, value)
import Html.Events exposing (onClick, onInput)
import Http exposing (Error)
import Json.Decode as Decode
import Json.Encode as Encode
import View.Control
import View.Facebook


port renderGoogleSignInButton : () -> Cmd msg


port renderGoogleMaps : Encode.Value -> Cmd msg


port execute : Encode.Value -> Cmd msg


port signOut : () -> Cmd msg


port replaceData : Encode.Value -> Cmd msg


port receiveIdToken : (String -> msg) -> Sub msg


port signedOut : (() -> msg) -> Sub msg


port executionProgress : (Encode.Value -> msg) -> Sub msg


port markerPositionChanged : (Encode.Value -> msg) -> Sub msg


type Msg
    = ReceiveIdToken String
    | ReceiveSessionCreateResponse (Result Error Session)
    | SignOut
    | SignedOut ()
    | ExecutionProgress (Result Decode.Error Progress)
    | CreateExecution
    | CloseModal
    | Execute
    | RequestChanged (Request -> Request)
    | NoOp


type ModalContent
    = SignInRequired


type alias Model =
    { session : Maybe Session
    , modalContent : Maybe ModalContent
    , request : Request
    , progress : Maybe Progress
    , mapOptions : MapOptions
    }


center =
    { lat = 35.5, lng = 140.1 }


initialModel =
    { session = Nothing
    , modalContent = Nothing
    , request =
        { travelMode = Driving
        , time = 90 * 60
        , origin = center
        , preference = Balance
        , smoothGeometry = True
        , dissolveGeometry = True
        , avoidFerries = False
        , avoidHighways = True
        , avoidTolls = False
        }
    , progress = Nothing
    , mapOptions = { zoom = 9, center = center }
    }


main : Program () Model Msg
main =
    Browser.element
        { init =
            \() ->
                ( initialModel
                , Cmd.batch [ renderGoogleMaps (MapOptions.encode initialModel.mapOptions) ]
                )
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


subscriptions _ =
    Sub.batch
        [ receiveIdToken ReceiveIdToken
        , signedOut SignedOut
        , executionProgress (Decode.decodeValue Progress.decode >> ExecutionProgress)
        , markerPositionChanged
            (Decode.decodeValue LatLng.decode
                >> (\originOrErr request ->
                        originOrErr
                            |> Result.map (\origin -> { request | origin = origin })
                            |> Result.withDefault request
                   )
                >> RequestChanged
            )
        ]


update msg model =
    case msg of
        ReceiveIdToken token ->
            ( model
            , Session.create token ReceiveSessionCreateResponse
            )

        ReceiveSessionCreateResponse (Ok session) ->
            ( { model
                | session = Just session
                , modalContent =
                    case model.modalContent of
                        Just SignInRequired ->
                            Nothing

                        other ->
                            other
              }
            , Cmd.none
            )

        SignOut ->
            ( { model | session = Nothing }, signOut () )

        CreateExecution ->
            case model.session of
                Nothing ->
                    ( { model | modalContent = Just SignInRequired }
                    , Cmd.batch [ renderGoogleSignInButton () ]
                    )

                Just _ ->
                    ( model, Cmd.batch [ execute (Request.encode model.request) ] )

        CloseModal ->
            ( { model | modalContent = Nothing }, Cmd.none )

        ExecutionProgress (Ok progress) ->
            ( { model | progress = Just progress }, Cmd.batch [ replaceData (Progress.encode progress) ] )

        RequestChanged updateRequest ->
            ( { model | request = updateRequest model.request }, Cmd.none )

        other ->
            let
                _ =
                    Debug.log "unexpected Msg" other
            in
            ( model, Cmd.none )


view model =
    div [ style "position" "relative" ]
        [ div [ id "fb-root" ] []
        , section []
            [ h1 [] [ text "walk30m.com" ]
            , p [] [ text "A handy and delightful isochronous solution" ]
            , model.session
                |> Maybe.map sessionView
                |> Maybe.withDefault (p [] [])
            ]
        , mapView model
        , View.Control.view RequestChanged NoOp model.request
        , div []
            [ button [ onClick CreateExecution ] [ text "Start" ]
            , model.progress
                |> Maybe.map (\{ progress } -> p [] [ text (String.fromFloat (progress * 100) ++ "% Done") ])
                |> Maybe.withDefault (p [] [])
            ]
        , View.Facebook.view
        , modalView model
        ]


sessionView (Session _ { displayName }) =
    div
        [ style "position" "absolute"
        , style "right" "0"
        , style "top" "0"
        , style "pdding" "1em"
        ]
        [ text displayName
        , button [ onClick SignOut ] [ text "Sign Out" ]
        ]


mapView model =
    div
        [ id "google-maps"
        , style "width" "800px"
        , style "height" "400px"
        , style "background" "#ddd"
        ]
        []


modalView model =
    div
        [ style "position" "fixed"
        , style "left" "0"
        , style "top" "0"
        , style "width" "100%"
        , style "height" "100%"
        , style "background" "rgba(0,0,0,.5)"
        , style "display"
            (model.modalContent
                |> Maybe.map (\_ -> "block")
                |> Maybe.withDefault "none"
            )
        ]
        [ case model.modalContent of
            Just SignInRequired ->
                div
                    [ style "background" "white", style "position" "fixed", style "padding" "2em" ]
                    [ p [] [ text "To continue, please sign in." ]
                    , div [ id "google-signin-button-container" ] []
                    , button [ onClick CloseModal ] [ text "Close" ]
                    ]

            Nothing ->
                div [] []
        ]

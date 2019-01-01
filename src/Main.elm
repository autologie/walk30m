port module Main exposing (main)

import Browser
import Data.Execution as Execution exposing (Execution(..))
import Data.LatLng as LatLng exposing (LatLng)
import Data.MapOptions as MapOptions exposing (MapOptions)
import Data.Preference as Preference exposing (Preference(..))
import Data.Progress as Progress exposing (Progress)
import Data.Request as Request exposing (Request)
import Data.Session as Session exposing (Session(..))
import Data.Transaction as Transaction exposing (Currency(..), Transaction)
import Data.TravelMode as TravelMode exposing (TravelMode(..))
import Html exposing (Html, button, div, h1, input, label, option, p, section, select, span, text)
import Html.Attributes exposing (attribute, checked, class, disabled, id, selected, style, type_, value)
import Html.Events exposing (onClick, onInput)
import Http exposing (Error)
import Json.Decode as Decode
import Json.Encode as Encode
import Task
import View.Control
import View.Facebook


port renderGoogleSignInButton : () -> Cmd msg


port renderGoogleMaps : Encode.Value -> Cmd msg


port execute : Encode.Value -> Cmd msg


port signOut : () -> Cmd msg


port replaceData : Encode.Value -> Cmd msg


port renderPaypalButton : String -> Cmd msg


port receiveIdToken : (String -> msg) -> Sub msg


port signedOut : (() -> msg) -> Sub msg


port executionProgress : (Encode.Value -> msg) -> Sub msg


port markerPositionChanged : (Encode.Value -> msg) -> Sub msg


port onPaypalAuthorize : (String -> msg) -> Sub msg


type Msg
    = ReceiveIdToken String
    | ReceiveSessionCreateResponse (Result Error Session)
    | SignOut
    | SignedOut ()
    | ExecutionCreated (Result String Execution)
    | ExecutionCompleted (Result String Execution)
    | ExecutionProgress (Result Decode.Error Progress)
    | PaypalTokenReceived (Result String String)
    | TransactionCreated (Result String ())
    | PaypalAuthorized String
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
    , mapOptions : MapOptions
    , error : Maybe String
    , apiBaseUrl : String
    , ongoingExecution : Maybe Execution
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
    , mapOptions = { zoom = 9, center = center }
    , error = Nothing
    , apiBaseUrl = "http://localhost:8080"
    , ongoingExecution = Nothing
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
        , onPaypalAuthorize PaypalAuthorized
        ]


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ReceiveIdToken token ->
            ( model
            , Session.create token ReceiveSessionCreateResponse
            )

        ReceiveSessionCreateResponse (Ok ((Session authToken _) as session)) ->
            ( { model
                | session = Just session
                , modalContent =
                    case model.modalContent of
                        Just SignInRequired ->
                            Nothing

                        other ->
                            other
              }
            , Transaction.fetchToken
                { authToken = authToken
                , baseUrl = model.apiBaseUrl
                }
                |> Task.attempt PaypalTokenReceived
            )

        SignOut ->
            ( { model | session = Nothing }, signOut () )

        CreateExecution ->
            case model.session of
                Nothing ->
                    ( { model | modalContent = Just SignInRequired }
                    , Cmd.batch [ renderGoogleSignInButton () ]
                    )

                Just (Session token _) ->
                    ( model
                    , Execution.create
                        model.request
                        { authToken = token, baseUrl = model.apiBaseUrl }
                        |> Task.attempt ExecutionCreated
                    )

        ExecutionCreated (Ok ((Ongoing _ request _) as execution)) ->
            ( { model | ongoingExecution = Just execution }, execute (Request.encode request) )

        ExecutionCreated (Err err) ->
            ( model |> withError err, Cmd.none )

        CloseModal ->
            ( { model | modalContent = Nothing }, Cmd.none )

        ExecutionProgress (Ok progress) ->
            case ( progress.progress == 1, model.ongoingExecution, model.session ) of
                ( True, Just execution, Just (Session authToken _) ) ->
                    ( { model | ongoingExecution = Nothing }
                    , Cmd.batch
                        [ Execution.complete execution
                            { authToken = authToken, baseUrl = model.apiBaseUrl }
                            |> Task.attempt ExecutionCompleted
                        , replaceData (Progress.encode progress)
                        ]
                    )

                ( False, Just (Ongoing id request progressHistory), _ ) ->
                    ( { model | ongoingExecution = Just (Ongoing id request ([ progress ] ++ progressHistory)) }
                    , replaceData (Progress.encode progress)
                    )

                _ ->
                    ( model, Cmd.none )

        RequestChanged updateRequest ->
            ( { model | request = updateRequest model.request }, Cmd.none )

        PaypalTokenReceived (Ok token) ->
            ( model, renderPaypalButton token )

        PaypalAuthorized nonce ->
            model.session
                |> Maybe.map
                    (\(Session authToken _) ->
                        ( model
                        , Transaction.create
                            { itemAmount = 100
                            , paymentAmount = 3000
                            , currency = JPY
                            , nonce = nonce
                            }
                            { authToken = authToken
                            , baseUrl = model.apiBaseUrl
                            }
                            |> Task.attempt TransactionCreated
                        )
                    )
                |> Maybe.withDefault ( model, Cmd.none )

        other ->
            let
                _ =
                    Debug.log "unexpected Msg" other
            in
            ( model, Cmd.none )


withError err model =
    { model
        | error = Just err
    }


view : Model -> Html Msg
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
        , errorView model
        , mapView model
        , View.Control.view RequestChanged NoOp model.request
        , div []
            [ button
                [ onClick CreateExecution
                , disabled
                    (model.ongoingExecution
                        |> Maybe.map (\_ -> True)
                        |> Maybe.withDefault False
                    )
                ]
                [ text "Start" ]
            , case model.ongoingExecution of
                Just (Ongoing _ _ (head :: tail)) ->
                    p [] [ text (String.fromFloat (head.progress * 100) ++ "% Done") ]

                _ ->
                    p [] []
            ]
        , View.Facebook.view
        , div [ id "paypal-button" ] []
        , modalView model
        ]


errorView model =
    case model.error of
        Just err ->
            p [ style "color" "red" ] [ text err ]

        Nothing ->
            p [] []


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
        , style "align-items" "center"
        , style "justify-content" "center"
        , style "display"
            (model.modalContent
                |> Maybe.map (\_ -> "flex")
                |> Maybe.withDefault "none"
            )
        ]
        [ case model.modalContent of
            Just SignInRequired ->
                div
                    [ style "background" "white"
                    , style "position" "fixed"
                    , style "padding" "2em"
                    , style "max-width" "500px"
                    , style "border-radius" ".5em"
                    ]
                    [ p [ style "font-size" "1.5em" ] [ text "To continue, please sign in." ]
                    , p [] [ text "For fair use for as many people as possible, we restrict the number of free executions per user." ]
                    , div [ id "google-signin-button-container" ] []
                    , button [ onClick CloseModal ] [ text "Close" ]
                    ]

            Nothing ->
                div [] []
        ]

<?php

namespace laravel\app\Nova;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\MergeValue;
use laravel\app\Nova\Resource;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Auth\PasswordValidationRules;
use Laravel\Nova\Card;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Gravatar;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphToMany;
use Laravel\Nova\Fields\Password;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;
use Laravel\Nova\Panel;
use Laravel\Nova\ResourceTool;
use Sereny\NovaPermissions\Nova\Permission;
use Sereny\NovaPermissions\Nova\Role;

class User extends Resource
{
    use PasswordValidationRules;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\laravel\app\Models\User>
     */
    public static $model = \laravel\app\Models\User::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'name', 'email',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return MergeValue
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Gravatar::make()->maxWidth(50),

            Text::make('Clerk user id', 'clerk_user_id')
                ->readonly()
                ->onlyOnDetail(),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'max:255'),

            Text::make('Email')
                ->sortable()
                ->rules('required', 'email', 'max:254')
                ->creationRules('unique:users,email')
                ->updateRules('unique:users,email,{{resourceId}}'),

            Text::make('First name', 'first_name'),

            Text::make('Last name', 'last_name'),

            Password::make('Password')
                ->onlyOnForms()
                ->creationRules($this->optionalPasswordRules())
                ->updateRules($this->optionalPasswordRules()),

            MorphToMany::make('Roles', 'roles', Role::class)
                ->canSee(fn ($request) => $request->user()?->isSuperAdmin()),

            MorphToMany::make('Permissions', 'permissions', Permission::class)
                ->canSee(fn ($request) => $request->user()?->isSuperAdmin()),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @return array<int, Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
